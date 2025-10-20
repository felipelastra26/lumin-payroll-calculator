# Simple Integration Guide (Without Context)

Since the PayrollContext is causing initialization issues, use this simpler direct integration approach.

## Approach: Direct Hook Usage

Instead of wrapping the app with PayrollProvider, pages can directly import and use the `usePayrollData` hook.

## Step 1: Update a Page to Use Real Data

### Example: Payroll Summary Results Page

```javascript
import React, { useEffect } from 'react';
import { usePayrollData } from '../../hooks/usePayrollData';

function PayrollSummaryResults() {
  // Use the hook directly (no Context needed!)
  const {
    payrollData,
    isLoading,
    error,
    isCalculated,
    calculatePayroll,
    payPeriodStart,
    payPeriodEnd
  } = usePayrollData();

  // Auto-calculate on mount if not already calculated
  useEffect(() => {
    if (!isCalculated && !isLoading) {
      // Only calculate if we have data
      // For now, we'll keep showing mock data until user uploads timecard
    }
  }, [isCalculated, isLoading]);

  // If we have real payroll data, use it; otherwise use mock data
  const displayData = payrollData || {
    // ... existing mock data
  };

  return (
    <div>
      {isLoading && <div>Loading payroll data...</div>}
      {error && <div>Error: {error}</div>}
      
      {/* Rest of your existing UI using displayData */}
    </div>
  );
}
```

## Step 2: Key Points

### ✅ Advantages
- No Context initialization issues
- Each page manages its own state
- Simpler debugging
- No app-wide provider needed

### ⚠️ Considerations
- Hook state is NOT shared between pages
- Each page that uses the hook will have its own instance
- For shared state, you'd need to lift state up or use a different approach

## Step 3: Alternative - Single Instance Hook

If you need shared state across pages, create a singleton instance:

### Create `src/services/payrollManager.js`:

```javascript
import { useState, useCallback } from 'react';
import { getTransactions, getServiceProviders } from './azureService';
import { calculatePayroll } from './payrollService';

// Singleton state (outside React)
let globalPayrollState = {
  data: null,
  isLoading: false,
  error: null
};

const listeners = new Set();

function notifyListeners() {
  listeners.forEach(listener => listener(globalPayrollState));
}

export function usePayrollManager() {
  const [state, setState] = useState(globalPayrollState);

  useEffect(() => {
    listeners.add(setState);
    return () => listeners.delete(setState);
  }, []);

  const calculate = useCallback(async (startDate, endDate) => {
    globalPayrollState = { ...globalPayrollState, isLoading: true, error: null };
    notifyListeners();

    try {
      const [transactions, providers] = await Promise.all([
        getTransactions(startDate, endDate),
        getServiceProviders()
      ]);

      const results = calculatePayroll(transactions, providers, null, startDate, endDate);
      
      globalPayrollState = { data: results, isLoading: false, error: null };
      notifyListeners();
    } catch (err) {
      globalPayrollState = { ...globalPayrollState, isLoading: false, error: err.message };
      notifyListeners();
    }
  }, []);

  return {
    ...state,
    calculate
  };
}
```

## Step 4: Recommended Immediate Action

**For now, keep using mock data in pages** until we resolve the Context issue or implement one of these alternatives:

1. **Option A**: Use direct hook (no shared state)
2. **Option B**: Use singleton pattern (shared state without Context)
3. **Option C**: Debug and fix the PayrollContext issue

Which approach would you like me to implement?

