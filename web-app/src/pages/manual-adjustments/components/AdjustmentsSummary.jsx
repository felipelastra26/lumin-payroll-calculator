import React from 'react';
import Icon from '../../../components/AppIcon';

const AdjustmentsSummary = ({ adjustments, employees }) => {
  const calculateSummary = () => {
    const summary = {
      totalDeductions: 0,
      totalBonuses: 0,
      deductionCount: 0,
      bonusCount: 0,
      employeesAffected: new Set(),
      recurringCount: 0
    };

    adjustments?.forEach(adjustment => {
      if (adjustment?.type === 'deduction') {
        summary.totalDeductions += adjustment?.amount;
        summary.deductionCount++;
      } else {
        summary.totalBonuses += adjustment?.amount;
        summary.bonusCount++;
      }
      
      summary?.employeesAffected?.add(adjustment?.employeeId);
      
      if (adjustment?.isRecurring) {
        summary.recurringCount++;
      }
    });

    summary.netAdjustment = summary?.totalBonuses - summary?.totalDeductions;
    summary.employeesAffectedCount = summary?.employeesAffected?.size;

    return summary;
  };

  const summary = calculateSummary();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(Math.abs(amount));
  };

  const summaryCards = [
    {
      title: 'Total Deductions',
      value: formatCurrency(summary?.totalDeductions),
      count: `${summary?.deductionCount} adjustment${summary?.deductionCount !== 1 ? 's' : ''}`,
      icon: 'Minus',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Total Bonuses',
      value: formatCurrency(summary?.totalBonuses),
      count: `${summary?.bonusCount} adjustment${summary?.bonusCount !== 1 ? 's' : ''}`,
      icon: 'Plus',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Net Impact',
      value: formatCurrency(summary?.netAdjustment),
      count: summary?.netAdjustment >= 0 ? 'Net increase' : 'Net decrease',
      icon: summary?.netAdjustment >= 0 ? 'TrendingUp' : 'TrendingDown',
      color: summary?.netAdjustment >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: summary?.netAdjustment >= 0 ? 'bg-green-50' : 'bg-red-50',
      borderColor: summary?.netAdjustment >= 0 ? 'border-green-200' : 'border-red-200'
    },
    {
      title: 'Employees Affected',
      value: summary?.employeesAffectedCount?.toString(),
      count: `of ${employees?.length} total employees`,
      icon: 'Users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];

  if (adjustments?.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
          <Icon name="BarChart3" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Adjustments Summary</h2>
          <p className="text-sm text-muted-foreground">
            Overview of all manual adjustments for this pay period
          </p>
        </div>
      </div>
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards?.map((card, index) => (
          <div key={index} className={`border rounded-lg p-4 ${card?.bgColor} ${card?.borderColor}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/80`}>
                <Icon name={card?.icon} size={16} className={card?.color} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {card?.title}
              </p>
              <p className={`text-2xl font-bold ${card?.color}`}>
                {card?.value}
              </p>
              <p className="text-xs text-muted-foreground">
                {card?.count}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recurring Adjustments */}
        {summary?.recurringCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Repeat" size={16} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                Recurring Adjustments
              </span>
            </div>
            <p className="text-sm text-amber-700">
              {summary?.recurringCount} adjustment{summary?.recurringCount !== 1 ? 's' : ''} will be applied to future pay periods
            </p>
          </div>
        )}

        {/* Impact Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Info" size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Payroll Impact
            </span>
          </div>
          <p className="text-sm text-blue-700">
            These adjustments will be applied during final payroll calculation
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdjustmentsSummary;