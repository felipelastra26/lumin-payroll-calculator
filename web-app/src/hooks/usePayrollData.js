import { useState, useCallback } from 'react';
import { getTransactions, getServiceProviders } from '../services/azureService';
import { calculatePayroll } from '../services/payrollService';
import { parseTimecardFile } from '../services/timecardParser';

/**
 * Custom hook for managing payroll data integration
 * Wraps Codex-generated services (azureService, payrollService) with React state management
 * Transforms data to match the format expected by rocket.new pages
 */
export function usePayrollData() {
  // State management
  const [timecardData, setTimecardData] = useState(null);
  const [payrollResults, setPayrollResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);
  
  // Pay period configuration
  const [payPeriodStart, setPayPeriodStart] = useState(new Date('2025-10-05'));
  const [payPeriodEnd, setPayPeriodEnd] = useState(new Date('2025-10-19'));
  const [payDate, setPayDate] = useState(new Date('2025-10-24'));

  // Employee configuration (matches business rules)
  const employeeConfig = {
    'Aubrie B': { position: 'Senior Stylist', commissionRate: 0.40, hourlyRate: 14.00, type: 'mixed' },
    'Megan T': { position: 'Senior Stylist', commissionRate: 0.40, hourlyRate: 14.00, type: 'mixed' },
    'Hilda': { position: 'Master Stylist', commissionRate: 0.50, hourlyRate: 14.00, type: 'mixed' },
    'Kennedi B': { position: 'Stylist', commissionRate: 0.00, hourlyRate: 14.00, type: 'hourly' },
    'Valerie C': { position: 'Stylist', commissionRate: 0.00, hourlyRate: 14.00, type: 'hourly' },
    'Erika Perez': { position: 'Stylist', commissionRate: 0.00, hourlyRate: 14.00, type: 'hourly' },
    'Stylist Chelese': { position: 'Stylist', commissionRate: 0.00, hourlyRate: 14.00, type: 'hourly' }
  };

  /**
   * Upload and parse timecard Excel file
   */
  const uploadTimecard = useCallback(async (file) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const parsed = await parseTimecardFile(file);
      setTimecardData(parsed);
      
      setIsLoading(false);
      return parsed;
    } catch (err) {
      setError(`Failed to parse timecard: ${err.message}`);
      setIsLoading(false);
      throw err;
    }
  }, []);

  /**
   * Calculate payroll using Codex-generated services
   */
  const calculatePayrollData = useCallback(async () => {
    if (!timecardData) {
      setError('Please upload a timecard file first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch data from Azure (Codex-generated service)
      const [transactions, serviceProviders] = await Promise.all([
        getTransactions(payPeriodStart, payPeriodEnd),
        getServiceProviders()
      ]);

      // Calculate payroll (Codex-generated service)
      const results = calculatePayroll(
        transactions,
        serviceProviders,
        timecardData,
        payPeriodStart,
        payPeriodEnd
      );

      // Transform to format expected by pages
      const transformedResults = transformPayrollResults(results);
      
      setPayrollResults(transformedResults);
      setIsCalculated(true);
      setIsLoading(false);
      
      return transformedResults;
    } catch (err) {
      setError(`Failed to calculate payroll: ${err.message}`);
      setIsLoading(false);
      throw err;
    }
  }, [timecardData, payPeriodStart, payPeriodEnd]);

  /**
   * Transform Codex service output to match page expectations
   */
  const transformPayrollResults = (results) => {
    const dateRange = `${formatDate(payPeriodStart)} - ${formatDate(payPeriodEnd)}`;
    const calculationDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Transform employees array
    const employees = results.employees.map((emp, index) => {
      const config = employeeConfig[emp.name] || {
        position: 'Stylist',
        commissionRate: 0,
        hourlyRate: 14.00,
        type: 'hourly'
      };

      return {
        id: index + 1,
        name: emp.name,
        position: config.position,
        payStructure: getPayStructureLabel(config.type),
        totalPay: emp.totalPay,
        week1Pay: emp.week1?.totalPay || 0,
        week2Pay: emp.week2?.totalPay || 0,
        commissionRate: config.commissionRate,
        hourlyRate: config.hourlyRate,
        
        // Detailed breakdown
        week1: emp.week1,
        week2: emp.week2,
        transactions: emp.transactions,
        timecardHours: emp.timecardHours,
        
        // Additional details for employee detail page
        addings: {
          total: (emp.week1?.addings || 0) + (emp.week2?.addings || 0),
          fullSets: emp.fullSetsCount || 0,
          refills: emp.refillsCount || 0
        },
        tips: {
          total: (emp.week1?.tips || 0) + (emp.week2?.tips || 0),
          week1: emp.week1?.tips || 0,
          week2: emp.week2?.tips || 0
        },
        discounts: {
          total: (emp.week1?.discountDeduction || 0) + (emp.week2?.discountDeduction || 0),
          week1: emp.week1?.discountDeduction || 0,
          week2: emp.week2?.discountDeduction || 0
        }
      };
    });

    return {
      totalPayroll: results.summary.totalPayroll,
      employeeCount: employees.length,
      dateRange,
      calculationDate,
      payDate: payDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      employees,
      summary: {
        totalCommission: results.summary.totalCommission,
        totalHourly: results.summary.totalHourly,
        totalTips: results.summary.totalTips,
        totalAddings: results.summary.totalAddings
      }
    };
  };

  /**
   * Get pay structure label for display
   */
  const getPayStructureLabel = (type) => {
    switch (type) {
      case 'mixed':
        return 'Mixed';
      case 'commission':
        return 'Commission';
      case 'hourly':
        return 'Hourly';
      default:
        return 'Unknown';
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  /**
   * Set pay period dates
   */
  const setPayPeriod = useCallback((startDate, endDate) => {
    setPayPeriodStart(new Date(startDate));
    setPayPeriodEnd(new Date(endDate));
    setIsCalculated(false); // Reset calculation flag
  }, []);

  /**
   * Update pay date
   */
  const updatePayDate = useCallback((date) => {
    setPayDate(new Date(date));
  }, []);

  /**
   * Add manual adjustment to employee
   */
  const addManualAdjustment = useCallback((employeeId, adjustment) => {
    if (!payrollResults) return;

    const updatedEmployees = payrollResults.employees.map(emp => {
      if (emp.id === employeeId) {
        const adjustmentAmount = adjustment.type === 'deduction' 
          ? -Math.abs(adjustment.amount)
          : Math.abs(adjustment.amount);
        
        return {
          ...emp,
          totalPay: emp.totalPay + adjustmentAmount,
          manualAdjustments: [
            ...(emp.manualAdjustments || []),
            {
              ...adjustment,
              amount: adjustmentAmount,
              date: new Date()
            }
          ]
        };
      }
      return emp;
    });

    const newTotalPayroll = updatedEmployees.reduce((sum, emp) => sum + emp.totalPay, 0);

    setPayrollResults({
      ...payrollResults,
      employees: updatedEmployees,
      totalPayroll: newTotalPayroll
    });
  }, [payrollResults]);

  /**
   * Reset all data
   */
  const reset = useCallback(() => {
    setTimecardData(null);
    setPayrollResults(null);
    setIsCalculated(false);
    setError(null);
  }, []);

  // Return hook interface
  return {
    // Data
    payrollData: payrollResults,
    employees: payrollResults?.employees || [],
    summary: payrollResults?.summary || {},
    
    // State
    isLoading,
    error,
    isCalculated,
    hasTimecard: !!timecardData,
    
    // Actions
    uploadTimecard,
    calculatePayroll: calculatePayrollData,
    setPayPeriod,
    setPayDate: updatePayDate,
    addManualAdjustment,
    reset,
    
    // Current selections
    payPeriodStart,
    payPeriodEnd,
    payDate
  };
}

export default usePayrollData;

