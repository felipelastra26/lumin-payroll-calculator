"""
Azure Blob Storage Connector
Handles connection and data extraction from Azure Data Lake Storage Gen2
"""

import pandas as pd
import io
from datetime import datetime, timedelta
from azure.storage.filedatalake import DataLakeServiceClient
from typing import Optional, List, Dict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AzureDataConnector:
    """Connector for Azure Data Lake Storage Gen2"""
    
    def __init__(self, account_url: str, container_name: str, sas_token: str):
        """
        Initialize Azure Data Lake Storage connector
        
        Args:
            account_url: Azure storage account URL
            container_name: Container name
            sas_token: SAS token for authentication
        """
        self.account_url = account_url
        self.container_name = container_name
        self.sas_token = sas_token
        
        # Create service client
        self.service_client = DataLakeServiceClient(
            account_url=account_url,
            credential=sas_token
        )
        self.file_system_client = self.service_client.get_file_system_client(
            file_system=container_name
        )
        
        logger.info(f"Connected to Azure Storage: {account_url}/{container_name}")
    
    def get_file_content(self, file_path: str) -> bytes:
        """
        Download file content from Azure Blob Storage
        
        Args:
            file_path: Path to file in container
            
        Returns:
            File content as bytes
        """
        try:
            file_client = self.file_system_client.get_file_client(file_path)
            download = file_client.download_file()
            content = download.readall()
            logger.info(f"Downloaded file: {file_path} ({len(content)} bytes)")
            return content
        except Exception as e:
            logger.error(f"Error downloading {file_path}: {str(e)}")
            raise
    
    def read_csv_to_dataframe(self, file_path: str) -> pd.DataFrame:
        """
        Read CSV file from Azure Blob Storage into pandas DataFrame
        
        Args:
            file_path: Path to CSV file in container
            
        Returns:
            pandas DataFrame
        """
        try:
            content = self.get_file_content(file_path)
            csv_content = content.decode('utf-8')
            df = pd.read_csv(io.StringIO(csv_content))
            logger.info(f"Loaded CSV: {file_path} ({len(df)} rows, {len(df.columns)} columns)")
            return df
        except Exception as e:
            logger.error(f"Error reading CSV {file_path}: {str(e)}")
            raise
    
    def get_transactions_for_period(
        self,
        start_date: datetime,
        end_date: datetime,
        table_path: str = "Transaction details/Transaction details.csv"
    ) -> pd.DataFrame:
        """
        Get transaction data for a specific pay period
        
        Args:
            start_date: Start date of pay period
            end_date: End date of pay period
            table_path: Path to transaction table
            
        Returns:
            Filtered DataFrame with transactions in date range
        """
        logger.info(f"Fetching transactions from {start_date.date()} to {end_date.date()}")
        
        # Read transaction data
        df = self.read_csv_to_dataframe(table_path)
        
        # Convert date column to datetime (adjust column name as needed)
        # Common date column names: 'Date', 'TransactionDate', 'CreatedDate'
        date_columns = ['Date', 'TransactionDate', 'CreatedDate', 'InvoiceDate']
        date_col = None
        
        for col in date_columns:
            if col in df.columns:
                date_col = col
                break
        
        if date_col is None:
            logger.warning(f"No date column found in transaction data. Available columns: {df.columns.tolist()}")
            return df
        
        # Convert to datetime
        df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
        
        # Filter by date range
        mask = (df[date_col] >= start_date) & (df[date_col] <= end_date)
        filtered_df = df[mask].copy()
        
        logger.info(f"Found {len(filtered_df)} transactions in period")
        return filtered_df
    
    def get_service_provider_details(
        self,
        table_path: str = "Service provider details/Service provider details.csv"
    ) -> pd.DataFrame:
        """
        Get service provider details
        
        Args:
            table_path: Path to service provider table
            
        Returns:
            DataFrame with service provider information
        """
        logger.info("Fetching service provider details")
        df = self.read_csv_to_dataframe(table_path)
        return df
    
    def get_discount_details(
        self,
        start_date: datetime,
        end_date: datetime,
        table_path: str = "Discount details/Discount details.csv"
    ) -> pd.DataFrame:
        """
        Get discount details for a specific pay period
        
        Args:
            start_date: Start date of pay period
            end_date: End date of pay period
            table_path: Path to discount table
            
        Returns:
            Filtered DataFrame with discounts in date range
        """
        logger.info(f"Fetching discounts from {start_date.date()} to {end_date.date()}")
        
        try:
            df = self.read_csv_to_dataframe(table_path)
            
            # Find date column
            date_columns = ['Date', 'DiscountDate', 'CreatedDate']
            date_col = None
            
            for col in date_columns:
                if col in df.columns:
                    date_col = col
                    break
            
            if date_col is None:
                logger.warning(f"No date column found in discount data. Available columns: {df.columns.tolist()}")
                return df
            
            # Convert to datetime and filter
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            mask = (df[date_col] >= start_date) & (df[date_col] <= end_date)
            filtered_df = df[mask].copy()
            
            logger.info(f"Found {len(filtered_df)} discounts in period")
            return filtered_df
        except Exception as e:
            logger.warning(f"Could not load discount details: {str(e)}")
            return pd.DataFrame()
    
    def list_available_tables(self) -> List[str]:
        """
        List all available tables (directories) in the container
        
        Returns:
            List of table names
        """
        paths = self.file_system_client.get_paths()
        directories = [path.name for path in paths if path.is_directory]
        logger.info(f"Found {len(directories)} tables")
        return sorted(directories)

