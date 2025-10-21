/**
 * Payroll Calculation Service
 * Handles all payroll calculations based on business rules
 */

import { getServiceCommission, getServiceAdding } from './azureService';

/**
 * Calculate payroll for all employees
 */
export function calculatePayroll(employees, transactions, timecardData, payPeriod, adjustments = []) {
  const results = employees.map(employee => {
    return calculateEmployeePayroll(employee, transactions, timecardData, payPeriod, adjustments);
  });
  
  return results;
}

/**
 * Calculate payroll for a single employee
 */
export function calculateEmployeePayroll(employee, transactions, timecardData, payPeriod, adjustments = []) {
  const { startDate, endDate } = payPeriod;
  
  // Get employee transactions
  const employeeTransactions = transactions.filter(t => t.ServiceProviderID === employee.id);
  
  // Split into two weeks
  const midDate = new Date(startDate);
  midDate.setDate(midDate.getDate() + 7);
  
  const week1Trans = employeeTransactions.filter(t => {
    const date = new Date(t.TransactionDate);
    return date >= new Date(startDate) && date < midDate;
  });
  
  const week2Trans = employeeTransactions.filter(t => {
    const date = new Date(t.TransactionDate);
    return date >= midDate && date <= new Date(endDate);
  });
  
  // Get hours from timecard
  const employeeHours = getEmployeeHours(employee, timecardData, payPeriod);
  
  // Calculate weekly pay
  const week1 = calculateWeeklyPay(employee, week1Trans, employeeHours.week1, payPeriod);
  const week2 = calculateWeeklyPay(employee, week2Trans, employeeHours.week2, payPeriod);
  
  // Get employee adjustments
  const employeeAdjustments = adjustments.filter(adj => adj.employeeId === employee.id);
  const totalAdjustments = employeeAdjustments.reduce((sum, adj) => {
    return sum + (adj.type === 'bonus' ? adj.amount : -adj.amount);
  }, 0);
  
  // Calculate final pay
  const finalPay = week1.total + week2.total + totalAdjustments;
  
  return {
    employee,
    week1,
    week2,
    adjustments: employeeAdjustments,
    totalAdjustments,
    finalPay,
    totalHours: employeeHours.week1.hours + employeeHours.week2.hours
  };
}

/**
 * Calculate weekly pay for an employee
 */
function calculateWeeklyPay(employee, transactions, hours, payPeriod) {
  const { payStructure, commissionRate, hourlyRate, hasAddings, hasTips, hasDiscountDeductions } = employee;
  
  // Calculate base pay based on structure
  let basePay = 0;
  let hourlyPay = hours.hours * hourlyRate;
  let commissionPay = 0;
  let services = [];
  
  // Calculate commission from transactions
  if (commissionRate > 0 && transactions.length > 0) {
    services = transactions.map(t => {
      // Calculate sale price from all payment types
      const salePrice = parseFloat(t.CCAmount || 0) + 
                       parseFloat(t.CashAmount || 0) + 
                       parseFloat(t.CheckAmount || 0) + 
                       parseFloat(t.ACHAmount || 0) + 
                       parseFloat(t.VagaroPayLaterAmount || 0) + 
                       parseFloat(t.OtherAmount || 0);
      
      // Get commission for this service
      let commission = 0;
      const serviceName = t.ItemSold || '';
      
      // Check if this is a member refill (shows $0 but has actual price)
      if (salePrice === 0 && serviceName.toLowerCase().includes('refill')) {
        // Use the actual service price for member refills
        commission = getServiceCommission(serviceName, commissionRate);
      } else {
        // Regular commission calculation
        commission = salePrice * (commissionRate / 100);
      }
      
      const adding = hasAddings ? getServiceAdding(serviceName) : 0;
      const tip = hasTips ? parseFloat(t.Tip || 0) : 0;
      const discount = parseFloat(t.Discount || 0);
      
      return {
        date: t.TransactionDate,
        client: t.CustomerID || 'Unknown',
        service: serviceName,
        salePrice,
        commission,
        adding,
        tip,
        discount
      };
    });
    
    commissionPay = services.reduce((sum, s) => sum + s.commission, 0);
  }
  
  // Determine base pay based on structure
  if (payStructure === 'commission_vs_hourly') {
    basePay = Math.max(hourlyPay, commissionPay);
  } else if (payStructure === 'pure_commission') {
    basePay = commissionPay;
  } else {
    basePay = hourlyPay;
  }
  
  // Calculate addings
  const addings = hasAddings ? services.reduce((sum, s) => sum + s.adding, 0) : 0;
  
  // Calculate tips
  const tips = hasTips ? services.reduce((sum, s) => sum + s.tip, 0) : 0;
  
  // Calculate discount deductions (50%)
  const totalDiscounts = services.reduce((sum, s) => sum + s.discount, 0);
  const discountDeduction = hasDiscountDeductions ? totalDiscounts * 0.5 : 0;
  
  // Calculate weekly total
  const total = basePay + addings + tips - discountDeduction;
  
  return {
    hours: hours.hours,
    hourlyPay,
    commissionPay,
    basePay,
    basePayType: payStructure === 'commission_vs_hourly' 
      ? (basePay === hourlyPay ? 'hourly' : 'commission')
      : payStructure,
    services,
    serviceCount: services.length,
    addings,
    tips,
    discountDeduction,
    total
  };
}

/**
 * Get employee hours from manual entry or timecard data
 */
function getEmployeeHours(employee, timecardData, payPeriod) {
  // Try to get manual hours from sessionStorage first
  const manualHoursStr = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('employeeHours') : null;
  if (manualHoursStr) {
    try {
      const manualHours = JSON.parse(manualHoursStr);
      if (manualHours[employee.id]) {
        return {
          week1: { hours: manualHours[employee.id].week1 || 0, days: [] },
          week2: { hours: manualHours[employee.id].week2 || 0, days: [] }
        };
      }
    } catch (e) {
      console.error('Error parsing manual hours:', e);
    }
  }
  
  // Fallback to timecard data if available
  if (timecardData && timecardData.employees) {
    const { startDate, endDate } = payPeriod;
    const { getEmployeeHours: getHours } = require('./timecardParser');
    return getHours(timecardData, employee.fullName || employee.name, new Date(startDate), new Date(endDate));
  }
  
  // Default to zero hours
  return {
    week1: { hours: 0, days: [] },
    week2: { hours: 0, days: [] }
  };
}

// Re-export from timecardParser
export { parseTimecardFile, getEmployeeHours } from './timecardParser';

export default {
  calculatePayroll,
  calculateEmployeePayroll,
  parseTimecardFile
};

