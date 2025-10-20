/**
 * Azure Blob Storage Service
 * Connects to Azure and fetches payroll data
 */

const AZURE_CONFIG = {
  accountUrl: 'https://184891storagewus2.dfs.core.windows.net',
  containerName: 'reports',
  sasToken: 'sv=2021-12-02&spr=https&st=2025-10-11T19%3A31%3A34Z&se=2027-10-11T19%3A36%3A34Z&sr=c&sp=rl&sig=VAAQLjkqKXExrRICFmzUet409qp7Rd%2BAbZLLN2haU9c%3D'
};

/**
 * Fetch CSV file from Azure Blob Storage
 */
async function fetchCSVFromAzure(filePath) {
  const url = `${AZURE_CONFIG.accountUrl}/${AZURE_CONFIG.containerName}/${filePath}?${AZURE_CONFIG.sasToken}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
    }
    
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error(`Error fetching ${filePath}:`, error);
    throw error;
  }
}

/**
 * Parse CSV text to array of objects
 */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
}

/**
 * Get all service providers (employees)
 */
export async function getServiceProviders() {
  try {
    const data = await fetchCSVFromAzure('Service provider details/Service provider details.csv');
    
    return data
      .filter(sp => sp.ServiceProviderStatus === 'Active')
      .map(sp => ({
        id: sp.ServiceProviderID,
        firstName: sp.ServiceProviderFirstName,
        lastName: sp.ServiceProviderLastName,
        fullName: `${sp.ServiceProviderFirstName} ${sp.ServiceProviderLastName}`,
        employeeType: sp.EmployeeType,
        status: sp.ServiceProviderStatus
      }));
  } catch (error) {
    console.error('Error fetching service providers:', error);
    return [];
  }
}

/**
 * Get transactions for a date range
 */
export async function getTransactions(startDate, endDate) {
  try {
    // Fetch from dated snapshot files
    const transactions = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Try to fetch dated snapshots
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const filePath = `Transaction details/Transaction details-${dateStr}.csv`;
      
      try {
        const data = await fetchCSVFromAzure(filePath);
        transactions.push(...data);
      } catch (error) {
        console.warn(`No snapshot for ${dateStr}, skipping`);
      }
    }
    
    // If no dated snapshots, try main file
    if (transactions.length === 0) {
      const data = await fetchCSVFromAzure('Transaction details/Transaction details.csv');
      transactions.push(...data);
    }
    
    // Filter by date range
    return transactions.filter(t => {
      const transDate = new Date(t.TransactionDate);
      return transDate >= start && transDate <= end;
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

/**
 * Get employee configuration based on name
 * This maps employee names to their pay structures
 */
export function getEmployeePayStructure(employeeName) {
  const name = employeeName.toLowerCase();
  
  // Commission vs Hourly (40%)
  if (name.includes('aubrie') || name.includes('megan')) {
    return {
      payStructure: 'commission_vs_hourly',
      commissionRate: 40,
      hourlyRate: 14.00,
      hasAddings: true,
      hasTips: true,
      hasDiscountDeductions: true
    };
  }
  
  // Pure Commission (50%)
  if (name.includes('hilda')) {
    return {
      payStructure: 'pure_commission',
      commissionRate: 50,
      hourlyRate: 0,
      hasAddings: false,
      hasTips: true,
      hasDiscountDeductions: true
    };
  }
  
  // Hourly Only
  return {
    payStructure: 'hourly_only',
    commissionRate: 0,
    hourlyRate: 14.00,
    hasAddings: false,
    hasTips: false,
    hasDiscountDeductions: false
  };
}

/**
 * Calculate service commission based on service name
 */
export function getServiceCommission(serviceName, commissionRate) {
  // Service price lookup (from your commission table)
  const servicePrices = {
    // Full Sets
    'Classic Full Set': 34.65,
    'Wet Look Full Set': 38.15,
    'Hybrid Full Set': 45.15,
    'Russian Volume Full Set': 48.65,
    'Wispy Lashes Full Set': 55.65,
    
    // Refills
    'Classic Refill': 38.45,
    'Wet Look Refill': 40.58,
    'Hybrid Refill': 39.17,
    'Russian Volume Refill': 52.00,
    'Wispy Lash Refill': 90.50,
    
    // Other Services
    'Lash Lift': 22.50,
    'Brow Lamination': 22.50,
    'Lash Removal': 9.00,
    'Wax - Eyebrows': 6.00
  };
  
  // Find matching service
  let price = 0;
  for (const [key, value] of Object.entries(servicePrices)) {
    if (serviceName && serviceName.includes(key)) {
      price = value;
      break;
    }
  }
  
  return price * (commissionRate / 100);
}

/**
 * Calculate addings for a service
 */
export function getServiceAdding(serviceName) {
  if (!serviceName) return 0;
  
  const name = serviceName.toLowerCase();
  
  // Full Sets = $4
  if (name.includes('full set')) {
    return 4.00;
  }
  
  // Refills (non-member) = $2
  if (name.includes('refill') && !name.includes('member') && !name.includes('pass')) {
    return 2.00;
  }
  
  return 0;
}

export default {
  getServiceProviders,
  getTransactions,
  getEmployeePayStructure,
  getServiceCommission,
  getServiceAdding
};

