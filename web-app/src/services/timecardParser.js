/**
 * Timecard Excel Parser
 * Parses Excel timecard files to extract employee hours
 */

import * as XLSX from 'xlsx';

/**
 * Parse timecard Excel file
 * @param {File} file - The Excel file to parse
 * @returns {Promise<Object>} Parsed timecard data
 */
export async function parseTimecardFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Parse all sheets (one per employee)
        const employees = [];
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const employeeData = parseEmployeeSheet(worksheet, sheetName);
          
          if (employeeData) {
            employees.push(employeeData);
          }
        });
        
        resolve({
          employees,
          fileName: file.name,
          parsedAt: new Date()
        });
        
      } catch (error) {
        reject(new Error(`Failed to parse timecard: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse a single employee sheet
 * @param {Object} worksheet - XLSX worksheet object
 * @param {String} sheetName - Name of the sheet (employee name)
 * @returns {Object} Employee timecard data
 */
function parseEmployeeSheet(worksheet, sheetName) {
  try {
    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      return null; // Empty sheet
    }
    
    // Find the employee name (usually in first few rows)
    let employeeName = sheetName;
    
    // Look for employee name in first column
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      const row = jsonData[i];
      if (row[0] && typeof row[0] === 'string' && row[0].trim().length > 0) {
        // Check if this looks like a name (not a header)
        const text = row[0].trim();
        if (!text.match(/^(date|day|time|hours|total)/i)) {
          employeeName = text;
          break;
        }
      }
    }
    
    // Find the data table (look for "Date" header)
    let headerRowIndex = -1;
    let headers = [];
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const firstCell = row[0] ? String(row[0]).toLowerCase() : '';
      
      if (firstCell.includes('date') || firstCell.includes('day')) {
        headerRowIndex = i;
        headers = row.map(h => String(h || '').trim());
        break;
      }
    }
    
    if (headerRowIndex === -1) {
      console.warn(`No data table found in sheet: ${sheetName}`);
      return null;
    }
    
    // Parse time entries
    const timeEntries = [];
    let totalHours = 0;
    
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Stop if we hit a summary row or empty row
      if (!row[0] || String(row[0]).toLowerCase().includes('total')) {
        break;
      }
      
      const entry = parseTimeEntry(row, headers);
      if (entry && entry.hours > 0) {
        timeEntries.push(entry);
        totalHours += entry.hours;
      }
    }
    
    return {
      name: employeeName,
      timeEntries,
      totalHours: Math.round(totalHours * 100) / 100
    };
    
  } catch (error) {
    console.error(`Error parsing sheet ${sheetName}:`, error);
    return null;
  }
}

/**
 * Parse a single time entry row
 * @param {Array} row - Row data
 * @param {Array} headers - Column headers
 * @returns {Object} Time entry
 */
function parseTimeEntry(row, headers) {
  try {
    const entry = {};
    
    // Map headers to values
    headers.forEach((header, index) => {
      const value = row[index];
      const headerLower = header.toLowerCase();
      
      if (headerLower.includes('date') || headerLower.includes('day')) {
        entry.date = parseDate(value);
      } else if (headerLower.includes('in') || headerLower.includes('start')) {
        entry.timeIn = parseTime(value);
      } else if (headerLower.includes('out') || headerLower.includes('end')) {
        entry.timeOut = parseTime(value);
      } else if (headerLower.includes('hours') || headerLower.includes('total')) {
        entry.hours = parseHours(value);
      }
    });
    
    // If hours not provided, calculate from time in/out
    if (!entry.hours && entry.timeIn && entry.timeOut) {
      entry.hours = calculateHours(entry.timeIn, entry.timeOut);
    }
    
    return entry;
    
  } catch (error) {
    console.error('Error parsing time entry:', error);
    return null;
  }
}

/**
 * Parse date value
 */
function parseDate(value) {
  if (!value) return null;
  
  // Handle Excel date serial number
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    return new Date(date.y, date.m - 1, date.d);
  }
  
  // Handle string date
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  return null;
}

/**
 * Parse time value
 */
function parseTime(value) {
  if (!value) return null;
  
  // Handle Excel time serial number (fraction of day)
  if (typeof value === 'number') {
    const hours = Math.floor(value * 24);
    const minutes = Math.floor((value * 24 * 60) % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  // Handle string time
  if (typeof value === 'string') {
    return value.trim();
  }
  
  return null;
}

/**
 * Parse hours value
 */
function parseHours(value) {
  if (!value) return 0;
  
  // Handle number
  if (typeof value === 'number') {
    return value;
  }
  
  // Handle string (e.g., "8.5" or "8:30")
  if (typeof value === 'string') {
    const cleaned = value.trim();
    
    // Handle "HH:MM" format
    if (cleaned.includes(':')) {
      const [hours, minutes] = cleaned.split(':').map(Number);
      return hours + (minutes / 60);
    }
    
    // Handle decimal format
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  return 0;
}

/**
 * Calculate hours from time in/out
 */
function calculateHours(timeIn, timeOut) {
  try {
    const [inHour, inMin] = timeIn.split(':').map(Number);
    const [outHour, outMin] = timeOut.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    
    let diff = outMinutes - inMinutes;
    
    // Handle overnight shifts
    if (diff < 0) {
      diff += 24 * 60;
    }
    
    return Math.round((diff / 60) * 100) / 100;
    
  } catch (error) {
    return 0;
  }
}

/**
 * Get employee hours for a specific date range
 * @param {Object} timecardData - Parsed timecard data
 * @param {String} employeeName - Employee name
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} Hours breakdown
 */
export function getEmployeeHours(timecardData, employeeName, startDate, endDate) {
  const employee = timecardData.employees.find(emp => 
    emp.name.toLowerCase().includes(employeeName.toLowerCase()) ||
    employeeName.toLowerCase().includes(emp.name.toLowerCase())
  );
  
  if (!employee) {
    return { week1: { hours: 0, days: [] }, week2: { hours: 0, days: [] } };
  }
  
  // Split into two weeks
  const midDate = new Date(startDate);
  midDate.setDate(midDate.getDate() + 7);
  
  const week1Entries = employee.timeEntries.filter(entry => {
    const date = entry.date;
    return date >= startDate && date < midDate;
  });
  
  const week2Entries = employee.timeEntries.filter(entry => {
    const date = entry.date;
    return date >= midDate && date <= endDate;
  });
  
  const week1Hours = week1Entries.reduce((sum, entry) => sum + entry.hours, 0);
  const week2Hours = week2Entries.reduce((sum, entry) => sum + entry.hours, 0);
  
  return {
    week1: {
      hours: Math.round(week1Hours * 100) / 100,
      days: week1Entries
    },
    week2: {
      hours: Math.round(week2Hours * 100) / 100,
      days: week2Entries
    }
  };
}

export default {
  parseTimecardFile,
  getEmployeeHours
};

