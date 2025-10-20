"""
Payroll Calculator V2
Enhanced version that properly links transactions via ServiceProviderID
"""

import pandas as pd
from datetime import datetime
from typing import Dict, List, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PayrollCalculatorV2:
    """Calculate payroll for salon employees with proper transaction linking"""
    
    def __init__(
        self,
        hourly_rate: float = 14.00,
        senior_stylist_commission_rate: float = 0.40,
        discount_split_ratio: float = 0.50
    ):
        """Initialize payroll calculator"""
        self.hourly_rate = hourly_rate
        self.senior_stylist_commission_rate = senior_stylist_commission_rate
        self.discount_split_ratio = discount_split_ratio
        
        logger.info(f"PayrollCalculator initialized: hourly=${hourly_rate}, commission={senior_stylist_commission_rate*100}%")
    
    def link_employees_to_service_providers(
        self,
        employee_names: List[str],
        service_providers_df: pd.DataFrame
    ) -> Dict[str, str]:
        """
        Link employee names to ServiceProviderIDs
        
        Args:
            employee_names: List of employee names from timecard
            service_providers_df: DataFrame with service provider details
            
        Returns:
            Dictionary mapping employee name to ServiceProviderID
        """
        name_to_id = {}
        
        for emp_name in employee_names:
            # Extract first name
            first_name = emp_name.split()[0].lower()
            
            # Find matching service provider
            for idx, row in service_providers_df.iterrows():
                sp_first = str(row.get('ServiceProviderFirstName', '')).lower()
                
                if first_name in sp_first or sp_first in first_name:
                    sp_id = row['ServiceProviderID']
                    name_to_id[emp_name] = sp_id
                    logger.info(f"Linked: {emp_name} -> {sp_id} ({row.get('ServiceProviderFirstName', '')} {row.get('ServiceProviderLastName', '')})")
                    break
        
        return name_to_id
    
    def get_employee_transactions(
        self,
        transactions_df: pd.DataFrame,
        service_provider_id: str
    ) -> pd.DataFrame:
        """Get transactions for a specific service provider"""
        if 'ServiceProviderID' not in transactions_df.columns:
            logger.warning("ServiceProviderID column not found in transactions")
            return pd.DataFrame()
        
        emp_trans = transactions_df[transactions_df['ServiceProviderID'] == service_provider_id].copy()
        return emp_trans
    
    def calculate_sales_from_transactions(self, transactions_df: pd.DataFrame) -> float:
        """Calculate total sales from transactions"""
        if len(transactions_df) == 0:
            return 0.0
        
        # Sum all payment amounts
        total = 0.0
        payment_cols = ['CCAmount', 'CashAmount', 'CheckAmount', 'ACHAmount', 'VagaroPayLaterAmount', 'OtherAmount']
        
        for col in payment_cols:
            if col in transactions_df.columns:
                total += transactions_df[col].fillna(0).sum()
        
        return total
    
    def calculate_tips_from_transactions(self, transactions_df: pd.DataFrame) -> float:
        """Calculate total tips from transactions"""
        if len(transactions_df) == 0:
            return 0.0
        
        if 'Tip' in transactions_df.columns:
            return transactions_df['Tip'].fillna(0).sum()
        
        return 0.0
    
    def calculate_discounts_from_transactions(self, transactions_df: pd.DataFrame) -> float:
        """Calculate total discounts from transactions"""
        if len(transactions_df) == 0:
            return 0.0
        
        if 'Discount' in transactions_df.columns:
            return transactions_df['Discount'].fillna(0).sum()
        
        return 0.0
    
    def calculate_senior_stylist_pay(
        self,
        employee_name: str,
        total_hours: float,
        transactions_df: pd.DataFrame,
        service_provider_id: str = None
    ) -> Dict:
        """Calculate pay for senior stylist"""
        logger.info(f"Calculating pay for senior stylist: {employee_name}")
        
        # Get employee transactions
        if service_provider_id:
            emp_transactions = self.get_employee_transactions(transactions_df, service_provider_id)
        else:
            emp_transactions = pd.DataFrame()
        
        # Calculate hourly pay
        hourly_pay = total_hours * self.hourly_rate
        
        # Calculate commission from sales
        total_sales = self.calculate_sales_from_transactions(emp_transactions)
        commission = total_sales * self.senior_stylist_commission_rate
        
        # Calculate tips
        tips = self.calculate_tips_from_transactions(emp_transactions)
        
        # Calculate discount deduction
        total_discounts = self.calculate_discounts_from_transactions(emp_transactions)
        discount_deduction = total_discounts * self.discount_split_ratio
        
        # Base pay is higher of commission vs hourly
        base_pay = max(commission, hourly_pay)
        pay_method = "commission" if commission > hourly_pay else "hourly"
        
        # Total pay
        total_pay = base_pay + tips - discount_deduction
        
        result = {
            'employee_name': employee_name,
            'employee_type': 'senior_stylist',
            'total_hours': total_hours,
            'hourly_pay': hourly_pay,
            'total_sales': total_sales,
            'commission': commission,
            'pay_method': pay_method,
            'base_pay': base_pay,
            'tips': tips,
            'total_discounts': total_discounts,
            'discount_deduction': discount_deduction,
            'total_pay': total_pay,
            'transaction_count': len(emp_transactions)
        }
        
        logger.info(f"{employee_name}: Sales=${total_sales:.2f}, Commission=${commission:.2f}, "
                   f"Hourly=${hourly_pay:.2f}, Base=${base_pay:.2f} ({pay_method}), "
                   f"Tips=${tips:.2f}, Deduction=${discount_deduction:.2f}, Total=${total_pay:.2f}")
        
        return result
    
    def calculate_hourly_employee_pay(
        self,
        employee_name: str,
        total_hours: float,
        transactions_df: pd.DataFrame = None,
        service_provider_id: str = None
    ) -> Dict:
        """Calculate pay for hourly employee"""
        logger.info(f"Calculating pay for hourly employee: {employee_name}")
        
        # Calculate hourly pay
        hourly_pay = total_hours * self.hourly_rate
        
        # Calculate tips if available
        tips = 0.0
        if service_provider_id and transactions_df is not None:
            emp_transactions = self.get_employee_transactions(transactions_df, service_provider_id)
            tips = self.calculate_tips_from_transactions(emp_transactions)
        
        # Total pay
        total_pay = hourly_pay + tips
        
        result = {
            'employee_name': employee_name,
            'employee_type': 'hourly',
            'total_hours': total_hours,
            'hourly_pay': hourly_pay,
            'tips': tips,
            'total_pay': total_pay
        }
        
        logger.info(f"{employee_name}: Hourly=${hourly_pay:.2f}, Tips=${tips:.2f}, Total=${total_pay:.2f}")
        
        return result

