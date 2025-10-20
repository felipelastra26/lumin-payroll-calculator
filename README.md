# Lumin Payroll Calculator

Automated payroll calculator for Lumin salon that connects to Azure Blob Storage, processes transaction data, calculates commissions and tips for stylists, and generates comprehensive payroll reports.

## Features

- **Azure Blob Storage Integration**: Automatically fetches transaction and discount data from Azure Data Lake Storage Gen2
- **Flexible Pay Calculations**: 
  - Senior stylists: Higher of 40% commission vs. hourly ($14/hr)
  - Stylists: Hourly pay ($14/hr)
  - Front desk: Hourly pay ($14/hr)
- **Commission & Tips**: Calculates commissions from sales and tips from transactions
- **Discount Deductions**: Automatically deducts 50% of discounts from stylist pay
- **Addings Support**: Fixed dollar amounts for specific services/products
- **Timecard Processing**: Reads Excel timecards and calculates total hours worked
- **Automated Reports**: Generates detailed Excel payroll reports

## Pay Period Schedule

- **Pay Frequency**: Every other Friday
- **Pay Delay**: One week after end of pay period
- **Example**: Services performed Oct 5-18 are paid on Oct 24

## Installation

### Prerequisites

- Python 3.8 or higher
- Azure Blob Storage account with SAS token
- Excel timecard files

### Setup

1. Clone the repository:
```bash
git clone https://github.com/felipelastra26/lumin-payroll-calculator.git
cd lumin-payroll-calculator
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure Azure credentials:
```bash
cp config/config.example.yaml config/config.yaml
```

4. Edit `config/config.yaml` and add your Azure credentials:
```yaml
azure:
  account_url: "https://YOUR_ACCOUNT.dfs.core.windows.net"
  container_name: "reports"
  sas_token: "YOUR_SAS_TOKEN_HERE"
```

## Configuration

### Employee Configuration

Edit `config/config.yaml` to configure your employees:

```yaml
employees:
  senior_stylists:
    - name: "Aubrie B."
      employee_id: "aubrie_b"
      pay_type: "commission_vs_hourly"
      commission_rate: 0.40
      hourly_rate: 14.00
    - name: "Megan T."
      employee_id: "megan_t"
      pay_type: "commission_vs_hourly"
      commission_rate: 0.40
      hourly_rate: 14.00
  
  stylists:
    - name: "Kennedi B"
      employee_id: "kennedi_b"
      pay_type: "hourly"
      hourly_rate: 14.00
  
  front_desk:
    - name: "Valerie C."
      employee_id: "valerie_c"
      pay_type: "hourly"
      hourly_rate: 14.00
```

### Payroll Settings

```yaml
payroll:
  pay_frequency: "biweekly"
  pay_delay_days: 7
  hourly_rate: 14.00
  senior_stylist_commission_rate: 0.40
  discount_split_ratio: 0.50
```

## Usage

### Generate Payroll Report

```bash
python src/payroll_report.py \
  --config config/config.yaml \
  --timecard data/input/TimeCard.xlsx \
  --output data/output/payroll_report.xlsx
```

### Command-Line Arguments

- `--config`: Path to configuration YAML file (required)
- `--timecard`: Path to timecard Excel file (required)
- `--output`: Path to output Excel report (optional)

### Timecard Format

The timecard Excel file should have the following format:

```
Row 1: Oct 5, 2025 to Oct 18, 2025
Row 2: (blank)
Row 3: (blank)
Row 4: Entry Date | Employee | Role | Clock-In Time | Clock-Out Time | Total Hours | Comments | Edited By
Row 5+: Data rows
```

**Columns:**
- **Entry Date**: Date of work (e.g., "Oct 18, 2025")
- **Employee**: Employee name (e.g., "Aubrie B. Senior Stylist")
- **Role**: "Comission v hrly" or "Hourly Pay Rate"
- **Clock-In Time**: Time clocked in (e.g., "8:49 AM")
- **Clock-Out Time**: Time clocked out (e.g., "5:55 PM")
- **Total Hours**: Total hours worked (e.g., "9h 6m")
- **Comments**: Optional comments
- **Edited By**: Optional edit tracking

## Payroll Calculation Rules

### Senior Stylists (Commission vs. Hourly)

Senior stylists are paid the **higher** of:
1. **Commission**: 40% of total sales
2. **Hourly**: $14/hour × hours worked

**Additional earnings:**
- Tips from transactions
- Addings (fixed amounts for specific services)

**Deductions:**
- 50% of discount amounts

**Formula:**
```
Base Pay = MAX(Commission, Hourly Pay)
Total Pay = Base Pay + Tips + Addings - Discount Deduction
```

### Stylists (Hourly)

Stylists are paid:
- **Hourly**: $14/hour × hours worked
- **Tips**: Tips from transactions

**Formula:**
```
Total Pay = Hourly Pay + Tips
```

### Front Desk (Hourly)

Front desk staff are paid:
- **Hourly**: $14/hour × hours worked
- **Tips**: Tips from transactions (if applicable)

**Formula:**
```
Total Pay = Hourly Pay + Tips
```

## Azure Blob Storage Tables

The system reads data from the following Azure Blob Storage tables:

- `Transaction details/Transaction details.csv`: Transaction data with sales and tips
- `Service provider details/Service provider details.csv`: Service provider information
- `Discount details/Discount details.csv`: Discount data for deductions
- `Refund details/Refund details.csv`: Refund information (optional)

## Output Report

The generated Excel report contains:

### Sheet 1: Payroll Report
- Employee name
- Employee type (senior_stylist, hourly)
- Pay period start/end dates
- Pay date
- Total hours worked
- Total pay
- Breakdown: hourly pay, commission, tips, addings, deductions

### Sheet 2: Summary
- Pay period information
- Total employees
- Total hours
- Total payroll amount

## Project Structure

```
lumin-payroll-calculator/
├── src/
│   ├── azure_connector.py       # Azure Blob Storage connector
│   ├── payroll_calculator.py    # Payroll calculation logic
│   ├── timecard_processor.py    # Timecard processing
│   └── payroll_report.py        # Main report generator
├── config/
│   ├── config.example.yaml      # Example configuration
│   └── config.yaml              # Your configuration (not in git)
├── data/
│   ├── input/                   # Input timecard files
│   └── output/                  # Generated reports
├── tests/                       # Unit tests
├── docs/                        # Additional documentation
├── requirements.txt             # Python dependencies
├── .gitignore                   # Git ignore file
└── README.md                    # This file
```

## Examples

### Example 1: Basic Payroll Report

```bash
python src/payroll_report.py \
  --config config/config.yaml \
  --timecard data/input/TimeCard_Oct5-18.xlsx \
  --output data/output/payroll_Oct5-18.xlsx
```

### Example 2: Testing with Sample Data

```python
from src.payroll_report import PayrollReportGenerator

# Initialize generator
generator = PayrollReportGenerator('config/config.yaml')

# Generate report
report_df = generator.generate_payroll_report(
    timecard_path='data/input/TimeCard.xlsx',
    output_path='data/output/payroll_report.xlsx'
)

# View results
print(report_df)
```

## Troubleshooting

### Azure Connection Issues

If you encounter Azure connection errors:
1. Verify your SAS token is valid and not expired
2. Check that the account URL is correct
3. Ensure the container name matches your Azure storage

### Employee Name Matching

If employees are not being matched correctly:
1. Check that employee names in the timecard match the config
2. The system matches by first name - ensure first names are unique
3. Update the `name` field in `config.yaml` to match timecard names

### Missing Transaction Data

If transaction data is not found:
1. Verify the date range in the timecard
2. Check that transaction data exists in Azure for that period
3. Review the Azure table paths in `config.yaml`

## Security Notes

- **Never commit** `config/config.yaml` with real credentials to Git
- Store SAS tokens securely
- Use read-only SAS tokens with minimal permissions
- Set SAS token expiration dates appropriately

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary software for Lumin salon.

## Support

For issues or questions, please contact the development team.

## Changelog

### Version 1.0.0 (2025-10-19)
- Initial release
- Azure Blob Storage integration
- Commission vs. hourly calculation for senior stylists
- Hourly pay calculation for stylists and front desk
- Discount deduction support
- Tips calculation
- Excel report generation

