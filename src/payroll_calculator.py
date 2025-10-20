"""
Payroll Calculator
Handles payroll calculations for different employee types
"""

import pandas as pd
from datetime import datetime
from typing import Dict, List, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PayrollCalculator:
    """Calculate payroll for salon employees"""
    
    def __init__(
        self,
        hourly_rate: float = 14.00,
        senior_stylist_commission_rate: float = 0.40,
        discount_split_ratio: float = 0.50
    ):
        """
        Initialize payroll calculator
        
        Args:
            hourly_rate: Base hourly rate for all employees
            senior_stylist_commission_rate: Commission rate for senior stylists (e.g., 0.40 for 40%)
            discount_split_ratio: Ratio of discount deducted from stylist (e.g., 0.50 for 50%)
        """
        self.hourly_rate = hourly_rate
        self.senior_stylist_commission_rate = senior_stylist_commission_rate
        self.discount_split_ratio = discount_split_ratio
        
        logger.info(f"PayrollCalculator initialized: hourly=${hourly_rate}, commission={senior_stylist_commission_rate*100}%")
    
    def calculate_hourly_pay(self, total_hours: float, hourly_rate: float = None) -> float:
        """
        Calculate hourly pay
        
        Args:
            total_hours: Total hours worked
            hourly_rate: Hourly rate (uses default if not specified)
            
        Returns:
            Total hourly pay
        """
        rate = hourly_rate if hourly_rate is not None else self.hourly_rate
        return total_hours * rate
    
    def calculate_commission(
        self,
        transactions_df: pd.DataFrame,
        employee_name: str,
        commission_rate: float = None
    ) -> Tuple[float, pd.DataFrame]:
        """
        Calculate commission from transactions
        
        Args:
            transactions_df: DataFrame with transaction data
            employee_name: Name of employee to calculate commission for
            commission_rate: Commission rate (uses default if not specified)
            
        Returns:
            Tuple of (total_commission, filtered_transactions_df)
        """
        rate = commission_rate if commission_rate is not None else self.senior_stylist_commission_rate
        
        # Filter transactions for this employee
        # This will need to be adjusted based on actual column names in transaction data
        employee_transactions = self._filter_employee_transactions(transactions_df, employee_name)
        
        if len(employee_transactions) == 0:
            logger.warning(f"No transactions found for {employee_name}")
            return 0.0, employee_transactions
        
        # Calculate commission from transaction amounts
        # Assuming there's a column like 'Amount', 'Total', or 'TransactionAmount'
        amount_col = self._find_amount_column(employee_transactions)
        
        if amount_col is None:
            logger.error(f"Could not find amount column in transaction data")
            return 0.0, employee_transactions
        
        total_sales = employee_transactions[amount_col].sum()
        total_commission = total_sales * rate
        
        logger.info(f"{employee_name}: Sales=${total_sales:.2f}, Commission={rate*100}% = ${total_commission:.2f}")
        
        return total_commission, employee_transactions
    
    def calculate_tips(
        self,
        transactions_df: pd.DataFrame,
        employee_name: str
    ) -> Tuple[float, pd.DataFrame]:
        """
        Calculate tips from transactions
        
        Args:
            transactions_df: DataFrame with transaction data
            employee_name: Name of employee to calculate tips for
            
        Returns:
            Tuple of (total_tips, filtered_transactions_df)
        """
        # Filter transactions for this employee
        employee_transactions = self._filter_employee_transactions(transactions_df, employee_name)
        
        if len(employee_transactions) == 0:
            return 0.0, employee_transactions
        
        # Find tip column
        tip_col = self._find_tip_column(employee_transactions)
        
        if tip_col is None:
            logger.warning(f"No tip column found in transaction data")
            return 0.0, employee_transactions
        
        total_tips = employee_transactions[tip_col].sum()
        logger.info(f"{employee_name}: Tips=${total_tips:.2f}")
        
        return total_tips, employee_transactions
    
    def calculate_discount_deduction(
        self,
        discounts_df: pd.DataFrame,
        employee_name: str
    ) -> Tuple[float, pd.DataFrame]:
        """
        Calculate discount deduction (50% of discount amount)
        
        Args:
            discounts_df: DataFrame with discount data
            employee_name: Name of employee
            
        Returns:
            Tuple of (total_deduction, filtered_discounts_df)
        """
        if discounts_df is None or len(discounts_df) == 0:
            return 0.0, pd.DataFrame()
        
        # Filter discounts for this employee
        employee_discounts = self._filter_employee_transactions(discounts_df, employee_name)
        
        if len(employee_discounts) == 0:
            return 0.0, employee_discounts
        
        # Find discount amount column
        discount_col = self._find_discount_column(employee_discounts)
        
        if discount_col is None:
            logger.warning(f"No discount column found in discount data")
            return 0.0, employee_discounts
        
        total_discount = employee_discounts[discount_col].sum()
        deduction = total_discount * self.discount_split_ratio
        
        logger.info(f"{employee_name}: Discounts=${total_discount:.2f}, Deduction (50%)=${deduction:.2f}")
        
        return deduction, employee_discounts
    
    def calculate_addings(
        self,
        transactions_df: pd.DataFrame,
        employee_name: str,
        addings_config: Dict[str, float] = None
    ) -> Tuple[float, List[Dict]]:
        """
        Calculate "addings" - fixed dollar amounts for specific services/products
        
        Args:
            transactions_df: DataFrame with transaction data
            employee_name: Name of employee
            addings_config: Dictionary mapping service/product names to fixed amounts
            
        Returns:
            Tuple of (total_addings, list of adding details)
        """
        if addings_config is None:
            return 0.0, []
        
        # Filter transactions for this employee
        employee_transactions = self._filter_employee_transactions(transactions_df, employee_name)
        
        if len(employee_transactions) == 0:
            return 0.0, []
        
        # Find service/product column
        service_col = self._find_service_column(employee_transactions)
        
        if service_col is None:
            logger.warning(f"No service column found in transaction data")
            return 0.0, []
        
        total_addings = 0.0
        adding_details = []
        
        # Calculate addings based on service/product matches
        for service_name, adding_amount in addings_config.items():
            matching_transactions = employee_transactions[
                employee_transactions[service_col].str.contains(service_name, case=False, na=False)
            ]
            count = len(matching_transactions)
            if count > 0:
                subtotal = count * adding_amount
                total_addings += subtotal
                adding_details.append({
                    'service': service_name,
                    'count': count,
                    'amount_per': adding_amount,
                    'subtotal': subtotal
                })
        
        logger.info(f"{employee_name}: Addings=${total_addings:.2f}")
        
        return total_addings, adding_details
    
    def calculate_senior_stylist_pay(
        self,
        employee_name: str,
        total_hours: float,
        transactions_df: pd.DataFrame,
        discounts_df: pd.DataFrame = None,
        addings_config: Dict[str, float] = None
    ) -> Dict:
        """
        Calculate pay for senior stylist (higher of 40% commission vs hourly)
        
        Args:
            employee_name: Name of employee
            total_hours: Total hours worked
            transactions_df: Transaction data
            discounts_df: Discount data
            addings_config: Addings configuration
            
        Returns:
            Dictionary with pay breakdown
        """
        logger.info(f"Calculating pay for senior stylist: {employee_name}")
        
        # Calculate hourly pay
        hourly_pay = self.calculate_hourly_pay(total_hours)
        
        # Calculate commission
        commission, commission_transactions = self.calculate_commission(
            transactions_df, employee_name
        )
        
        # Calculate tips
        tips, tip_transactions = self.calculate_tips(transactions_df, employee_name)
        
        # Calculate addings
        addings, adding_details = self.calculate_addings(
            transactions_df, employee_name, addings_config
        )
        
        # Calculate discount deduction
        discount_deduction, discount_details = self.calculate_discount_deduction(
            discounts_df, employee_name
        )
        
        # Base pay is higher of commission vs hourly
        base_pay = max(commission, hourly_pay)
        pay_method = "commission" if commission > hourly_pay else "hourly"
        
        # Total pay = base_pay + tips + addings - discount_deduction
        total_pay = base_pay + tips + addings - discount_deduction
        
        result = {
            'employee_name': employee_name,
            'employee_type': 'senior_stylist',
            'total_hours': total_hours,
            'hourly_pay': hourly_pay,
            'commission': commission,
            'pay_method': pay_method,
            'base_pay': base_pay,
            'tips': tips,
            'addings': addings,
            'adding_details': adding_details,
            'discount_deduction': discount_deduction,
            'total_pay': total_pay,
            'transaction_count': len(commission_transactions)
        }
        
        logger.info(f"{employee_name}: Base=${base_pay:.2f} ({pay_method}), Tips=${tips:.2f}, "
                   f"Addings=${addings:.2f}, Deduction=${discount_deduction:.2f}, Total=${total_pay:.2f}")
        
        return result
    
    def calculate_hourly_employee_pay(
        self,
        employee_name: str,
        total_hours: float,
        transactions_df: pd.DataFrame = None
    ) -> Dict:
        """
        Calculate pay for hourly employee (stylist or front desk)
        
        Args:
            employee_name: Name of employee
            total_hours: Total hours worked
            transactions_df: Transaction data (for tips)
            
        Returns:
            Dictionary with pay breakdown
        """
        logger.info(f"Calculating pay for hourly employee: {employee_name}")
        
        # Calculate hourly pay
        hourly_pay = self.calculate_hourly_pay(total_hours)
        
        # Calculate tips if transaction data available
        tips = 0.0
        if transactions_df is not None and len(transactions_df) > 0:
            tips, _ = self.calculate_tips(transactions_df, employee_name)
        
        # Total pay = hourly + tips
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
    
    # Helper methods
    
    def _filter_employee_transactions(self, df: pd.DataFrame, employee_name: str) -> pd.DataFrame:
        """Filter transactions for a specific employee"""
        # Try common employee column names
        employee_cols = [
            'ServiceProviderFirstName', 'ServiceProviderLastName', 'ServiceProvider',
            'EmployeeName', 'Employee', 'Stylist', 'Provider'
        ]
        
        for col in employee_cols:
            if col in df.columns:
                # Try matching first name or full name
                name_parts = employee_name.split()
                first_name = name_parts[0] if name_parts else employee_name
                
                mask = df[col].str.contains(first_name, case=False, na=False)
                if mask.any():
                    return df[mask].copy()
        
        logger.warning(f"Could not find employee column. Available columns: {df.columns.tolist()}")
        return pd.DataFrame()
    
    def _find_amount_column(self, df: pd.DataFrame) -> str:
        """Find the transaction amount column"""
        amount_cols = ['Amount', 'Total', 'TransactionAmount', 'TotalAmount', 'Price', 'ServiceAmount']
        for col in amount_cols:
            if col in df.columns:
                return col
        return None
    
    def _find_tip_column(self, df: pd.DataFrame) -> str:
        """Find the tip column"""
        tip_cols = ['Tip', 'Tips', 'TipAmount', 'Gratuity']
        for col in tip_cols:
            if col in df.columns:
                return col
        return None
    
    def _find_discount_column(self, df: pd.DataFrame) -> str:
        """Find the discount amount column"""
        discount_cols = ['DiscountAmount', 'Discount', 'DiscountValue', 'Amount']
        for col in discount_cols:
            if col in df.columns:
                return col
        return None
    
    def _find_service_column(self, df: pd.DataFrame) -> str:
        """Find the service/product name column"""
        service_cols = ['ServiceTitle', 'Service', 'ServiceName', 'Product', 'ProductName', 'ItemName']
        for col in service_cols:
            if col in df.columns:
                return col
        return None

