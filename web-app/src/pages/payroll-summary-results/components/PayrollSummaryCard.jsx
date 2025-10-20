import React from 'react';
import Icon from '../../../components/AppIcon';

const PayrollSummaryCard = ({ totalPayroll, employeeCount, dateRange }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg">
          <Icon name="CheckCircle" size={24} className="text-success" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Payroll Calculation Complete</h2>
          <p className="text-sm text-muted-foreground">Bi-weekly payroll processed successfully</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center md:text-left">
          <div className="text-2xl font-bold text-primary mb-1">
            {formatCurrency(totalPayroll)}
          </div>
          <div className="text-sm text-muted-foreground">Total Payroll</div>
        </div>

        <div className="text-center md:text-left">
          <div className="text-2xl font-bold text-foreground mb-1">
            {employeeCount}
          </div>
          <div className="text-sm text-muted-foreground">Employees Processed</div>
        </div>

        <div className="text-center md:text-left">
          <div className="text-lg font-semibold text-foreground mb-1">
            {dateRange}
          </div>
          <div className="text-sm text-muted-foreground">Pay Period</div>
        </div>
      </div>
    </div>
  );
};

export default PayrollSummaryCard;