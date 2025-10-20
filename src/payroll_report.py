"""
Payroll Report Generator
Main module that orchestrates payroll calculation and report generation
"""

import pandas as pd
import yaml
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List
import logging

from azure_connector import AzureDataConnector
from payroll_calculator import PayrollCalculator
from timecard_processor import TimecardProcessor

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class PayrollReportGenerator:
    """Generate complete payroll reports"""
    
    def __init__(self, config_path: str):
        """
        Initialize payroll report generator
        
        Args:
            config_path: Path to configuration YAML file
        """
        logger.info(f"Initializing PayrollReportGenerator with config: {config_path}")
        
        # Load configuration
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)
        
        # Initialize components
        self.azure_connector = AzureDataConnector(
            account_url=self.config['azure']['account_url'],
            container_name=self.config['azure']['container_name'],
            sas_token=self.config['azure']['sas_token']
        )
        
        self.payroll_calculator = PayrollCalculator(
            hourly_rate=self.config['payroll']['hourly_rate'],
            senior_stylist_commission_rate=self.config['payroll']['senior_stylist_commission_rate'],
            discount_split_ratio=self.config['payroll']['discount_split_ratio']
        )
        
        self.timecard_processor = TimecardProcessor()
        
        logger.info("PayrollReportGenerator initialized successfully")
    
    def generate_payroll_report(
        self,
        timecard_path: str,
        output_path: str = None
    ) -> pd.DataFrame:
        """
        Generate complete payroll report
        
        Args:
            timecard_path: Path to timecard Excel file
            output_path: Path to save output report (optional)
            
        Returns:
            DataFrame with payroll report
        """
        logger.info("=" * 80)
        logger.info("GENERATING PAYROLL REPORT")
        logger.info("=" * 80)
        
        # Step 1: Read and process timecard
        logger.info("\n[1/5] Processing timecard...")
        timecard_df = self.timecard_processor.read_timecard(timecard_path)
        start_date, end_date = self.timecard_processor.parse_pay_period(timecard_path)
        hours_by_employee = self.timecard_processor.calculate_total_hours_by_employee(timecard_df)
        
        logger.info(f"Pay period: {start_date.date()} to {end_date.date()}")
        logger.info(f"Total employees: {len(hours_by_employee)}")
        
        # Step 2: Fetch transaction data from Azure
        logger.info("\n[2/5] Fetching transaction data from Azure Blob Storage...")
        transactions_df = self.azure_connector.get_transactions_for_period(
            start_date,
            end_date,
            self.config['azure_tables']['transactions']
        )
        
        logger.info(f"Transactions fetched: {len(transactions_df)}")
        
        # Step 3: Fetch discount data (if available)
        logger.info("\n[3/5] Fetching discount data...")
        try:
            discounts_df = self.azure_connector.get_discount_details(
                start_date,
                end_date,
                self.config['azure_tables'].get('discounts', 'Discount details/Discount details.csv')
            )
            logger.info(f"Discounts fetched: {len(discounts_df)}")
        except Exception as e:
            logger.warning(f"Could not fetch discounts: {str(e)}")
            discounts_df = pd.DataFrame()
        
        # Step 4: Calculate payroll for each employee
        logger.info("\n[4/5] Calculating payroll for each employee...")
        payroll_results = []
        
        # Get all employees from config
        all_employees = []
        all_employees.extend(self.config['employees'].get('senior_stylists', []))
        all_employees.extend(self.config['employees'].get('stylists', []))
        all_employees.extend(self.config['employees'].get('front_desk', []))
        
        # Match timecard employees to config
        timecard_employees = list(hours_by_employee.keys())
        employee_matches = self.timecard_processor.match_employee_names(
            timecard_employees,
            all_employees
        )
        
        for tc_name, emp_config in employee_matches.items():
            total_hours = hours_by_employee[tc_name]
            pay_type = emp_config.get('pay_type', 'hourly')
            
            logger.info(f"\nProcessing: {tc_name} ({pay_type})")
            
            if pay_type == 'commission_vs_hourly':
                # Senior stylist - calculate commission vs hourly
                result = self.payroll_calculator.calculate_senior_stylist_pay(
                    employee_name=tc_name,
                    total_hours=total_hours,
                    transactions_df=transactions_df,
                    discounts_df=discounts_df,
                    addings_config=emp_config.get('addings', None)
                )
            else:
                # Hourly employee
                result = self.payroll_calculator.calculate_hourly_employee_pay(
                    employee_name=tc_name,
                    total_hours=total_hours,
                    transactions_df=transactions_df
                )
            
            payroll_results.append(result)
        
        # Step 5: Generate report DataFrame
        logger.info("\n[5/5] Generating final report...")
        report_df = pd.DataFrame(payroll_results)
        
        # Add pay period info
        report_df['pay_period_start'] = start_date.date()
        report_df['pay_period_end'] = end_date.date()
        report_df['pay_date'] = (end_date + timedelta(days=7)).date()
        
        # Reorder columns
        columns_order = [
            'employee_name', 'employee_type', 'pay_period_start', 'pay_period_end',
            'pay_date', 'total_hours', 'total_pay'
        ]
        
        # Add optional columns if they exist
        optional_cols = ['hourly_pay', 'commission', 'pay_method', 'base_pay', 
                        'tips', 'addings', 'discount_deduction', 'transaction_count']
        
        for col in optional_cols:
            if col in report_df.columns:
                columns_order.append(col)
        
        report_df = report_df[columns_order]
        
        # Calculate totals
        total_payroll = report_df['total_pay'].sum()
        total_hours = report_df['total_hours'].sum()
        
        logger.info("\n" + "=" * 80)
        logger.info("PAYROLL REPORT SUMMARY")
        logger.info("=" * 80)
        logger.info(f"Pay Period: {start_date.date()} to {end_date.date()}")
        logger.info(f"Pay Date: {(end_date + timedelta(days=7)).date()}")
        logger.info(f"Total Employees: {len(report_df)}")
        logger.info(f"Total Hours: {total_hours:.2f}")
        logger.info(f"Total Payroll: ${total_payroll:,.2f}")
        logger.info("=" * 80)
        
        # Display individual results
        print("\n" + report_df.to_string(index=False))
        
        # Save to file if output path specified
        if output_path:
            self._save_report(report_df, output_path, start_date, end_date)
        
        return report_df
    
    def _save_report(
        self,
        report_df: pd.DataFrame,
        output_path: str,
        start_date: datetime,
        end_date: datetime
    ):
        """Save report to Excel file"""
        logger.info(f"\nSaving report to: {output_path}")
        
        # Create Excel writer
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            # Write main report
            report_df.to_excel(writer, sheet_name='Payroll Report', index=False)
            
            # Create summary sheet
            summary_data = {
                'Pay Period Start': [start_date.date()],
                'Pay Period End': [end_date.date()],
                'Pay Date': [(end_date + timedelta(days=7)).date()],
                'Total Employees': [len(report_df)],
                'Total Hours': [report_df['total_hours'].sum()],
                'Total Payroll': [report_df['total_pay'].sum()]
            }
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
        
        logger.info(f"Report saved successfully: {output_path}")
    
    def generate_detailed_breakdown(
        self,
        timecard_path: str,
        employee_name: str,
        output_path: str = None
    ) -> Dict:
        """
        Generate detailed breakdown for a specific employee
        
        Args:
            timecard_path: Path to timecard Excel file
            employee_name: Name of employee
            output_path: Path to save output (optional)
            
        Returns:
            Dictionary with detailed breakdown
        """
        logger.info(f"Generating detailed breakdown for: {employee_name}")
        
        # Read timecard and get dates
        timecard_df = self.timecard_processor.read_timecard(timecard_path)
        start_date, end_date = self.timecard_processor.parse_pay_period(timecard_path)
        
        # Get employee hours
        hours_by_employee = self.timecard_processor.calculate_total_hours_by_employee(timecard_df)
        total_hours = hours_by_employee.get(employee_name, 0)
        
        # Fetch data
        transactions_df = self.azure_connector.get_transactions_for_period(
            start_date, end_date
        )
        
        try:
            discounts_df = self.azure_connector.get_discount_details(start_date, end_date)
        except:
            discounts_df = pd.DataFrame()
        
        # Calculate payroll with details
        # This would need employee config - simplified for now
        result = self.payroll_calculator.calculate_senior_stylist_pay(
            employee_name=employee_name,
            total_hours=total_hours,
            transactions_df=transactions_df,
            discounts_df=discounts_df
        )
        
        return result


def main():
    """Main entry point for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Lumin Payroll Calculator')
    parser.add_argument('--config', required=True, help='Path to config YAML file')
    parser.add_argument('--timecard', required=True, help='Path to timecard Excel file')
    parser.add_argument('--output', help='Path to output Excel file')
    
    args = parser.parse_args()
    
    # Generate report
    generator = PayrollReportGenerator(args.config)
    report_df = generator.generate_payroll_report(
        timecard_path=args.timecard,
        output_path=args.output
    )
    
    print("\nPayroll report generated successfully!")


if __name__ == '__main__':
    main()

