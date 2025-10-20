# Implementation Notes

## System Overview

The Lumin Payroll Calculator is a Python-based system that automates payroll calculation for your eyelash salon. It connects to Azure Blob Storage to fetch transaction data and processes Excel timecards to generate comprehensive payroll reports.

## Key Features Implemented

### 1. Azure Blob Storage Integration
- **Module**: `src/azure_connector.py`
- Connects to Azure Data Lake Storage Gen2
- Fetches transaction data for specific pay periods
- Retrieves service provider details
- Handles discount data (when available)

### 2. Payroll Calculation Logic
- **Module**: `src/payroll_calculator.py` and `src/payroll_calculator_v2.py`

**Senior Stylists (Commission vs Hourly):**
- Calculates both commission (40% of sales) and hourly pay ($14/hr)
- Pays whichever is higher
- Adds tips from transactions
- Supports "addings" (fixed amounts for specific services)
- Deducts 50% of discount amounts

**Stylists & Front Desk (Hourly):**
- Calculates hourly pay ($14/hr)
- Adds tips when applicable

### 3. Timecard Processing
- **Module**: `src/timecard_processor.py`
- Reads Excel timecard files
- Parses pay period dates
- Converts time strings (e.g., "9h 18m") to decimal hours
- Matches employees from timecard to configuration

### 4. Report Generation
- **Module**: `src/payroll_report.py`
- Orchestrates the entire payroll process
- Generates Excel reports with:
  - Individual employee breakdowns
  - Pay period summary
  - Total hours and payroll

## Data Flow

```
1. Read Timecard Excel File
   ↓
2. Extract Pay Period Dates (Oct 5-18, 2025)
   ↓
3. Calculate Total Hours per Employee
   ↓
4. Fetch Transactions from Azure (for pay period)
   ↓
5. Link Employees to ServiceProviderIDs
   ↓
6. Calculate Payroll for Each Employee:
   - Senior Stylists: MAX(Commission, Hourly) + Tips - Discounts
   - Hourly: Hourly Pay + Tips
   ↓
7. Generate Excel Report
```

## Azure Data Structure

### Transaction Details Table
**Key Columns:**
- `TransactionDate`: Date of transaction
- `ServiceProviderID`: Links to service provider
- `CCAmount`, `CashAmount`, `CheckAmount`, etc.: Payment amounts
- `Tip`: Tip amount
- `Discount`: Discount amount

### Service Provider Details Table
**Key Columns:**
- `ServiceProviderID`: Unique identifier
- `ServiceProviderFirstName`: First name
- `ServiceProviderLastName`: Last name
- `ServiceProviderStatus`: Active/Inactive

## Current Limitations & Next Steps

### Known Issues

1. **Employee Name Matching**
   - Currently matches by first name only
   - May need refinement if you have employees with same first name
   - Solution: Use ServiceProviderID mapping in config

2. **Transaction Linking**
   - Transactions use ServiceProviderID, not names
   - V2 calculator includes proper linking logic
   - Needs Service Provider table to map names to IDs

3. **Discount Table**
   - Discount details table doesn't exist in current Azure storage
   - System handles this gracefully (no discounts deducted)
   - Discounts are available in Transaction table's Discount column

### Recommended Enhancements

1. **Use PayrollCalculatorV2**
   - Update `payroll_report.py` to use `PayrollCalculatorV2`
   - Properly links transactions via ServiceProviderID
   - More accurate commission and tip calculations

2. **Add Addings Configuration**
   - Define specific services/products with fixed amounts
   - Example: "Full Set" = $5 adding, "Fill" = $3 adding
   - Configure in `config.yaml` under each employee

3. **Automated Scheduling**
   - Set up cron job to run every other Friday
   - Automatically process previous pay period
   - Email reports to management

4. **Enhanced Reporting**
   - Add detailed transaction breakdown per employee
   - Include service-level details
   - Generate PDF reports in addition to Excel

5. **Data Validation**
   - Verify all employees in timecard have Azure data
   - Alert on missing transactions
   - Validate pay period dates

## Testing Results

**Test Run (Oct 5-18, 2025):**
- Pay Period: Oct 5-18, 2025
- Pay Date: Oct 25, 2025
- Employees: 6
- Total Hours: 297.58
- Total Payroll: $4,166.12

**Breakdown:**
- Aubrie B. (Senior Stylist): 85.24 hrs → $1,193.36
- Megan T. (Senior Stylist): 58.75 hrs → $822.50
- Kennedi B (Stylist): 62.56 hrs → $875.84
- Valerie C. (Front Desk): 56.07 hrs → $784.98
- Erika Perez (Front Desk): 17.30 hrs → $242.20
- Stylist Chelese: 17.66 hrs → $247.24

**Note:** Current test shows hourly pay only because transaction linking needs ServiceProviderID mapping.

## Configuration Guide

### Employee Configuration

Each employee needs:
- `name`: Full name (must match timecard)
- `employee_id`: Unique identifier
- `pay_type`: "commission_vs_hourly" or "hourly"
- `commission_rate`: For commission employees (0.40 = 40%)
- `hourly_rate`: Hourly rate ($14.00)

### Azure Configuration

Required settings:
- `account_url`: Your Azure storage account URL
- `container_name`: Container name (usually "reports")
- `sas_token`: SAS token with read permissions
- Expiration: Check SAS token expiry (currently 2027-10-11)

## Security Considerations

1. **SAS Token Management**
   - Current token expires: 2027-10-11
   - Use read-only permissions
   - Rotate tokens periodically
   - Never commit `config/config.yaml` to Git

2. **Data Privacy**
   - Transaction data contains sensitive information
   - Store reports securely
   - Limit access to payroll reports
   - Consider encryption for stored reports

## Maintenance

### Regular Tasks

1. **Before Each Pay Period**
   - Verify Azure connection
   - Check SAS token expiration
   - Update employee configuration if needed

2. **After Each Pay Period**
   - Export timecard to Excel
   - Run payroll calculator
   - Review generated report
   - Archive reports securely

3. **Monthly**
   - Review employee configurations
   - Verify commission rates
   - Check for system updates

### Troubleshooting

**"No transactions found for employee"**
- Check ServiceProviderID mapping
- Verify employee worked during pay period
- Confirm transaction data exists in Azure

**"Could not find amount column"**
- Azure table structure may have changed
- Check actual column names in Azure
- Update column mapping in code

**"Azure connection failed"**
- Verify SAS token is valid
- Check network connectivity
- Confirm container name is correct

## Future Roadmap

1. **Phase 2: Enhanced Transaction Linking**
   - Implement ServiceProviderID mapping
   - Add service provider table integration
   - Improve commission accuracy

2. **Phase 3: Advanced Features**
   - Automated email reports
   - Web dashboard for viewing payroll
   - Historical payroll analysis
   - Year-to-date summaries

3. **Phase 4: Integration**
   - Direct integration with payroll systems
   - Automated bank transfers
   - Tax calculation and reporting
   - Time tracking integration

## Support & Contact

For issues or questions:
1. Check the README.md and QUICKSTART.md
2. Review this implementation notes document
3. Check GitHub issues
4. Contact development team

## Version History

**v1.0.0 (2025-10-19)**
- Initial release
- Azure Blob Storage integration
- Basic payroll calculation
- Excel report generation
- Commission vs hourly for senior stylists
- Discount deduction support

