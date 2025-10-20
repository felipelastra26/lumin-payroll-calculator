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
  if (commissionRate > 0) {
    services = transactions.map(t => {
      const commission = getServiceCommission(t.ItemSold, commissionRate);
      const adding = hasAddings ? getServiceAdding(t.ItemSold) : 0;
      
      return {
        date: t.TransactionDate,
        client: t.CustomerID || 'Unknown',
        service: t.ItemSold,
        sales: parseFloat(t.CCAmount || 0) + parseFloat(t.CashAmount || 0),
        commission,
        adding,
        tip: hasTips ? parseFloat(t.Tip || 0) : 0,
        discount: parseFloat(t.Discount || 0)
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
    addings,
    tips,
    discountDeduction,
    total
  };
}

/**
 * Get employee hours from timecard data
 */
function getEmployeeHours(employee, timecardData, payPeriod) {
  if (!timecardData || !timecardData.employees) {
    return {
      week1: { hours: 0, days: [] },
      week2: { hours: 0, days: [] }
    };
  }
  
  const { startDate, endDate } = payPeriod;
  const midDate = new Date(startDate);
  midDate.setDate(midDate.getDate() + 7);
  
  // Import the getEmployeeHours function from timecardParser
  const { getEmployeeHours: getHours } = require('./timecardParser');
  return getHours(timecardData, employee.fullName || employee.name, new Date(startDate), new Date(endDate));
}

// Re-export from timecardParser
export { parseTimecardFile, getEmployeeHours } from './timecardParser';

export default {
  calculatePayroll,
  calculateEmployeePayroll,
  parseTimecardFile
};

