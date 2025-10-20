# Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Configure Azure Credentials

1. Copy the example config:
```bash
cp config/config.example.yaml config/config.yaml
```

2. Edit `config/config.yaml` and add your Azure SAS token:
```yaml
azure:
  sas_token: "YOUR_SAS_TOKEN_HERE"
```

### Step 3: Prepare Your Timecard

Place your timecard Excel file in `data/input/`:
```bash
cp /path/to/your/TimeCard.xlsx data/input/
```

### Step 4: Run Payroll Calculator

```bash
python src/payroll_report.py \
  --config config/config.yaml \
  --timecard data/input/TimeCard.xlsx \
  --output data/output/payroll_report.xlsx
```

### Step 5: Review Report

Open the generated report:
```bash
open data/output/payroll_report.xlsx
```

## What the Report Contains

The Excel report includes:

1. **Payroll Report Sheet**
   - Each employee's hours, pay breakdown, and total
   - Commission vs. hourly calculations for senior stylists
   - Tips and addings
   - Discount deductions

2. **Summary Sheet**
   - Pay period dates
   - Total employees, hours, and payroll

## Example Output

```
Employee Name          | Type           | Hours  | Total Pay
-----------------------------------------------------------------
Aubrie B. Senior Stylist | senior_stylist | 89.25  | $1,245.50
Megan T. Senior Stylist  | senior_stylist | 78.50  | $1,089.00
Kennedi B                | hourly         | 70.75  | $990.50
Valerie C.               | hourly         | 56.00  | $784.00
```

## Common Issues

### Issue: "No transactions found for employee"

**Solution**: Check that employee names in the timecard match the Azure transaction data. The system matches by first name.

### Issue: "Could not find amount column"

**Solution**: The Azure transaction table may have different column names. Check the actual column names in your Azure data.

### Issue: "Azure connection failed"

**Solution**: 
1. Verify your SAS token is valid
2. Check the expiration date
3. Ensure you have read permissions

## Next Steps

- Review the full [README.md](../README.md) for detailed documentation
- Customize employee configurations in `config/config.yaml`
- Set up automated scheduling for payroll runs
- Add custom "addings" for specific services

## Need Help?

Check the troubleshooting section in the main README or contact the development team.

