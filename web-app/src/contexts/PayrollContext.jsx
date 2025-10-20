import React, { createContext, useContext } from 'react';
import { usePayrollData } from '../hooks/usePayrollData';

/**
 * Context for sharing payroll data across the application
 * Wraps the usePayrollData hook to make it available to all components
 */
const PayrollContext = createContext(null);

/**
 * Provider component that wraps the app and provides payroll data
 */
export function PayrollProvider({ children }) {
  const payrollData = usePayrollData();
  
  return (
    <PayrollContext.Provider value={payrollData}>
      {children}
    </PayrollContext.Provider>
  );
}

/**
 * Hook to access payroll data from any component
 * Usage: const { payrollData, calculatePayroll, isLoading } = usePayroll();
 */
export function usePayroll() {
  const context = useContext(PayrollContext);
  
  if (!context) {
    throw new Error('usePayroll must be used within a PayrollProvider');
  }
  
  return context;
}

export default PayrollContext;

