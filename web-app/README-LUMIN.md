# Lumin Salon Payroll Calculator - Web App

Automated payroll calculator for Lumin Salon with Azure Blob Storage integration.

## Quick Start

```bash
cd web-app
pnpm install
pnpm dev
```

Open http://localhost:5173

## Key Changes from Rocket.new Template

✅ **Azure Integration** - Connects to your Azure Blob Storage  
✅ **Dynamic Employees** - No hardcoded names, pulls from Azure  
✅ **Pay Period Selector** - User can choose dates  
✅ **Real Calculations** - Implements your payroll rules  

## Files Modified

- `src/pages/file-upload-dashboard/index.jsx` - Added date selectors, Azure employee loading
- `src/pages/employee-configuration/index.jsx` - Removed hardcoded employees, loads from Azure
- `src/services/azureService.js` - NEW: Azure Blob Storage connector
- `src/services/payrollService.js` - NEW: Payroll calculation logic

## How It Works

1. **Upload timecard** + select pay period dates
2. System loads employees from Azure automatically
3. Fetches transactions for pay period
4. Calculates payroll with your rules
5. Shows detailed breakdown
6. Export to PDF/Excel

