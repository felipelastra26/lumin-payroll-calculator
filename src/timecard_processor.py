"""
Timecard Processor
Handles reading and processing timecard Excel files
"""

import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TimecardProcessor:
    """Process timecard Excel files"""
    
    def __init__(self):
        """Initialize timecard processor"""
        logger.info("TimecardProcessor initialized")
    
    def read_timecard(self, file_path: str) -> pd.DataFrame:
        """
        Read timecard Excel file
        
        Args:
            file_path: Path to timecard Excel file
            
        Returns:
            DataFrame with timecard data
        """
        logger.info(f"Reading timecard: {file_path}")
        
        # Read Excel file, skipping first 3 rows to get to actual data
        df = pd.read_excel(file_path, sheet_name='TimeCard', skiprows=3)
        
        # Clean data - remove rows with NaN in Entry Date
        df = df[df['Entry Date'].notna()].copy()
        
        # Remove total row
        df = df[~df['Employee'].isna()]
        
        logger.info(f"Loaded {len(df)} timecard entries")
        return df
    
    def parse_pay_period(self, file_path: str) -> Tuple[datetime, datetime]:
        """
        Parse pay period dates from timecard file
        
        Args:
            file_path: Path to timecard Excel file
            
        Returns:
            Tuple of (start_date, end_date)
        """
        # Read first row to get date range
        df_raw = pd.read_excel(file_path, sheet_name='TimeCard', nrows=1)
        date_range_str = df_raw.iloc[0, 0]
        
        logger.info(f"Pay period string: {date_range_str}")
        
        # Parse date range (e.g., "Oct 5, 2025 to Oct 18, 2025")
        try:
            parts = date_range_str.split(' to ')
            start_date = pd.to_datetime(parts[0].strip())
            end_date = pd.to_datetime(parts[1].strip())
            
            logger.info(f"Pay period: {start_date.date()} to {end_date.date()}")
            return start_date, end_date
        except Exception as e:
            logger.error(f"Error parsing pay period: {str(e)}")
            raise
    
    def parse_hours(self, hours_str: str) -> float:
        """
        Parse hours string (e.g., "9h 18m") to decimal hours
        
        Args:
            hours_str: Hours string in format "Xh Ym"
            
        Returns:
            Total hours as decimal
        """
        if pd.isna(hours_str) or hours_str == '----':
            return 0.0
        
        try:
            # Parse hours and minutes
            hours = 0
            minutes = 0
            
            # Match patterns like "9h 18m" or "9h" or "18m"
            hour_match = re.search(r'(\d+)h', str(hours_str))
            min_match = re.search(r'(\d+)m', str(hours_str))
            
            if hour_match:
                hours = int(hour_match.group(1))
            if min_match:
                minutes = int(min_match.group(1))
            
            total_hours = hours + (minutes / 60.0)
            return round(total_hours, 2)
        except Exception as e:
            logger.warning(f"Error parsing hours '{hours_str}': {str(e)}")
            return 0.0
    
    def calculate_total_hours_by_employee(self, timecard_df: pd.DataFrame) -> Dict[str, float]:
        """
        Calculate total hours for each employee
        
        Args:
            timecard_df: DataFrame with timecard data
            
        Returns:
            Dictionary mapping employee name to total hours
        """
        logger.info("Calculating total hours by employee")
        
        # Parse hours for each entry
        timecard_df['hours_decimal'] = timecard_df['Total Hours'].apply(self.parse_hours)
        
        # Group by employee and sum hours
        hours_by_employee = timecard_df.groupby('Employee')['hours_decimal'].sum().to_dict()
        
        # Log results
        for employee, hours in hours_by_employee.items():
            logger.info(f"  {employee:40s}: {hours:6.2f} hours")
        
        return hours_by_employee
    
    def get_employee_role(self, timecard_df: pd.DataFrame, employee_name: str) -> str:
        """
        Get employee role from timecard
        
        Args:
            timecard_df: DataFrame with timecard data
            employee_name: Name of employee
            
        Returns:
            Employee role string
        """
        employee_rows = timecard_df[timecard_df['Employee'] == employee_name]
        if len(employee_rows) > 0:
            return employee_rows.iloc[0]['Role']
        return None
    
    def normalize_employee_name(self, name: str) -> str:
        """
        Normalize employee name for matching
        
        Args:
            name: Employee name
            
        Returns:
            Normalized name
        """
        # Remove extra spaces, convert to title case
        normalized = ' '.join(name.split()).strip()
        return normalized
    
    def match_employee_names(
        self,
        timecard_employees: List[str],
        config_employees: List[Dict]
    ) -> Dict[str, Dict]:
        """
        Match employee names from timecard to configuration
        
        Args:
            timecard_employees: List of employee names from timecard
            config_employees: List of employee configurations
            
        Returns:
            Dictionary mapping timecard name to config
        """
        matches = {}
        
        for tc_name in timecard_employees:
            tc_normalized = self.normalize_employee_name(tc_name)
            
            # Try to find match in config
            for emp_config in config_employees:
                config_name = emp_config.get('name', '')
                
                # Check if names match (fuzzy matching)
                if self._names_match(tc_normalized, config_name):
                    matches[tc_name] = emp_config
                    logger.info(f"Matched: '{tc_name}' -> '{config_name}'")
                    break
            
            if tc_name not in matches:
                logger.warning(f"No match found for employee: {tc_name}")
        
        return matches
    
    def _names_match(self, name1: str, name2: str) -> bool:
        """Check if two names match (fuzzy)"""
        # Simple matching: check if first name matches
        parts1 = name1.split()
        parts2 = name2.split()
        
        if len(parts1) == 0 or len(parts2) == 0:
            return False
        
        # Check first name
        first1 = parts1[0].lower()
        first2 = parts2[0].lower()
        
        return first1 == first2
    
    def generate_timecard_summary(self, timecard_df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate summary of timecard data
        
        Args:
            timecard_df: DataFrame with timecard data
            
        Returns:
            Summary DataFrame
        """
        logger.info("Generating timecard summary")
        
        # Calculate hours
        timecard_df['hours_decimal'] = timecard_df['Total Hours'].apply(self.parse_hours)
        
        # Group by employee
        summary = timecard_df.groupby(['Employee', 'Role']).agg({
            'hours_decimal': 'sum',
            'Entry Date': 'count'
        }).reset_index()
        
        summary.columns = ['Employee', 'Role', 'Total Hours', 'Days Worked']
        summary['Total Hours'] = summary['Total Hours'].round(2)
        
        return summary

