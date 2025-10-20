# Integration Guide: Connecting Pages to Real Azure Data

## Overview

This guide shows how to update rocket.new pages to use real data from Azure Blob Storage without modifying the UI/design.

## The Integration Pattern

### Step 1: Import the hook

```javascript
import { usePayroll } from '../../contexts/PayrollContext';
```

### Step 2: Use the hook in your component

```javascript
function PayrollSummaryResults() {
  const {
    payrollData,      // Calculated payroll results
    isLoading,        // Loading state
    error,            // Error message
    isCalculated,     // Whether calculation is complete
    calculatePayroll  // Function to trigger calculation
  } = usePayroll();
```

### Step 3: Replace mock data with real data

**Before (mock data):**
```javascript
const payrollData = {
  totalPayroll: 8247.50,
  employeeCount: 7,
  // ... hardcoded values
};
```

**After (real data):**
```javascript
const { payrollData, isLoading, error } = usePayroll();

// payrollData is null until calculated
// Show loading state or prompt to calculate
if (!payrollData) {
  return <div>Please upload timecard and calculate payroll</div>;
}
```

### Step 4: Handle loading and error states

```javascript
if (isLoading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={error} />;
}

if (!isCalculated) {
  return <PromptToCalculate />;
}

// Now use payrollData as before
return (
  <div>
    <h1>Total: ${payrollData.totalPayroll}</h1>
    {payrollData.employees.map(emp => (
      <EmployeeCard key={emp.id} employee={emp} />
    ))}
  </div>
);
```

## Example: Payroll Summary Results Page

### Original Code (Mock Data)

```javascript
import React, { useState } from 'react';

const PayrollSummaryResults = () => {
  // Mock payroll data
  const payrollData = {
    totalPayroll: 8247.50,
    employeeCount: 7,
    dateRange: "Oct 7 - Oct 20, 2024",
    employees: [
      { id: 1, name: "Aubrie B", totalPay: 1456.75, ... },
      // ... more mock employees
    ]
  };

  return (
    <div>
      <h1>Total Payroll: ${payrollData.totalPayroll}</h1>
      {/* ... rest of UI ... */}
    </div>
  );
};
```

### Updated Code (Real Data)

```javascript
import React, { useState, useEffect } from 'react';
import { usePayroll } from '../../contexts/PayrollContext';

const PayrollSummaryResults = () => {
  const {
    payrollData,
    isLoading,
    error,
    isCalculated,
    calculatePayroll
  } = usePayroll();

  // Auto-calculate on mount if timecard is uploaded
  useEffect(() => {
    if (!isCalculated && !isLoading) {
      // Could auto-calculate here, or wait for user action
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Calculating payroll...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={calculatePayroll}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data yet
  if (!payrollData) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold">No Payroll Data</h3>
          <p className="text-yellow-600">Please upload a timecard file and calculate payroll.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  // Now use payrollData exactly as before - same structure!
  return (
    <div>
      <h1>Total Payroll: ${payrollData.totalPayroll}</h1>
      <p>Employees: {payrollData.employeeCount}</p>
      <p>Period: {payrollData.dateRange}</p>
      
      {/* All the existing UI code works unchanged */}
      {payrollData.employees.map(emp => (
        <div key={emp.id}>
          <h3>{emp.name}</h3>
          <p>${emp.totalPay}</p>
        </div>
      ))}
    </div>
  );
};
```

## Data Structure

The `payrollData` object has the exact same structure as the mock data:

```javascript
{
  totalPayroll: 8247.50,
  employeeCount: 7,
  dateRange: "Oct 5 - Oct 19, 2025",
  calculationDate: "October 20, 2025",
  payDate: "October 24, 2025",
  employees: [
    {
      id: 1,
      name: "Aubrie B",
      position: "Senior Stylist",
      payStructure: "Mixed",
      totalPay: 1456.75,
      week1Pay: 728.50,
      week2Pay: 728.25,
      commissionRate: 0.40,
      hourlyRate: 14.00,
      
      // Additional detailed data
      week1: { hourlyPay, commissionPay, selectedPay, tips, addings, ... },
      week2: { ... },
      transactions: [...],
      addings: { total, fullSets, refills },
      tips: { total, week1, week2 },
      discounts: { total, week1, week2 }
    },
    // ... more employees
  ],
  summary: {
    totalCommission: 3067.75,
    totalHourly: 4723.00,
    totalTips: 456.75,
    totalAddings: 287.50
  }
}
```

## File Upload Dashboard Integration

```javascript
import { usePayroll } from '../../contexts/PayrollContext';

function FileUploadDashboard() {
  const { uploadTimecard, calculatePayroll, isLoading } = usePayroll();
  
  const handleFileUpload = async (file) => {
    try {
      await uploadTimecard(file);
      // Automatically calculate after upload
      await calculatePayroll();
      // Navigate to results
      navigate('/payroll-summary-results');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => handleFileUpload(e.target.files[0])}
        disabled={isLoading}
      />
    </div>
  );
}
```

## Pay Period Selection

```javascript
import { usePayroll } from '../../contexts/PayrollContext';

function PayPeriodSelector() {
  const { setPayPeriod, payPeriodStart, payPeriodEnd } = usePayroll();
  
  const handlePeriodChange = (start, end) => {
    setPayPeriod(start, end);
    // Recalculate with new dates
  };
  
  return (
    <div>
      <input
        type="date"
        value={payPeriodStart.toISOString().split('T')[0]}
        onChange={(e) => handlePeriodChange(e.target.value, payPeriodEnd)}
      />
      <input
        type="date"
        value={payPeriodEnd.toISOString().split('T')[0]}
        onChange={(e) => handlePeriodChange(payPeriodStart, e.target.value)}
      />
    </div>
  );
}
```

## Manual Adjustments

```javascript
import { usePayroll } from '../../contexts/PayrollContext';

function ManualAdjustments() {
  const { addManualAdjustment, employees } = usePayroll();
  
  const handleAddAdjustment = (employeeId, adjustment) => {
    addManualAdjustment(employeeId, {
      type: 'deduction', // or 'bonus'
      amount: 50.00,
      description: 'Uniform cost',
      date: new Date()
    });
  };
  
  return (
    <div>
      {/* Adjustment form */}
    </div>
  );
}
```

## Key Points

1. **No UI Changes**: The data structure matches mock data exactly
2. **Add States**: Handle loading, error, and no-data states
3. **Same Props**: All existing components receive the same props
4. **Gradual Migration**: Update pages one at a time
5. **Testing**: Test each page after integration

## Next Steps

1. Update File Upload Dashboard to use `uploadTimecard()`
2. Update Payroll Summary Results to use `payrollData`
3. Update Employee Detail Breakdown to use employee data
4. Update Manual Adjustments to use `addManualAdjustment()`
5. Add pay period selector component
6. Test with real Azure data

## Troubleshooting

### "usePayroll must be used within a PayrollProvider"
- Make sure App.jsx is wrapped with `<PayrollProvider>`

### Data is null
- Check that timecard was uploaded
- Check that `calculatePayroll()` was called
- Check browser console for errors

### Azure fetch fails
- Check SAS token expiration (2027-10-11)
- Check network connectivity
- Check Azure Blob Storage permissions

### Calculations don't match
- Verify pay period dates are correct
- Check timecard data format
- Review business rules in payrollService.js

