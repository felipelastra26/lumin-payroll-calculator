import React from 'react';
import Icon from '../../../components/AppIcon';

const PayrollMetrics = ({ metrics }) => {
  const formatCurrency = (amount) => {
    const numAmount = Number(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(numAmount);
  };

  const metricCards = [
    {
      label: 'Total Commission',
      value: formatCurrency(metrics?.totalCommission || 0),
      icon: 'TrendingUp',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Total Hourly',
      value: formatCurrency(metrics?.totalHourly || 0),
      icon: 'Clock',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Total Tips',
      value: formatCurrency(metrics?.totalTips || 0),
      icon: 'Heart',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      label: 'Total Addings',
      value: formatCurrency(metrics?.totalAddings || 0),
      icon: 'Plus',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metricCards?.map((metric, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metric?.bgColor}`}>
              <Icon name={metric?.icon} size={20} className={metric?.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-muted-foreground truncate">{metric?.label}</div>
              <div className="text-lg font-semibold text-foreground">{metric?.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PayrollMetrics;