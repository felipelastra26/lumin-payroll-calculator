import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const WeeklyBreakdown = ({ weekData, weekNumber }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatCurrency = (amount) => `$${amount?.toFixed(2)}`;

  return (
    <div className="bg-card border border-border rounded-lg mb-6">
      <div 
        className="flex items-center justify-between p-4 border-b border-border cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            weekNumber === 1 ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
          }`}>
            {weekNumber}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Week {weekNumber}</h3>
            <p className="text-sm text-muted-foreground">{weekData?.dateRange}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">{formatCurrency(weekData?.totalPay)}</div>
            <div className="text-sm text-muted-foreground">{weekData?.hoursWorked} hours</div>
          </div>
          <Icon 
            name={isExpanded ? "ChevronUp" : "ChevronDown"} 
            size={20} 
            className="text-muted-foreground" 
          />
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Pay Calculation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center">
                <Icon name="Calculator" size={16} className="mr-2 text-primary" />
                Pay Calculation
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hours Worked:</span>
                  <span className="font-mono">{weekData?.hoursWorked} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hourly Rate:</span>
                  <span className="font-mono">{formatCurrency(weekData?.hourlyRate)}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hourly Pay:</span>
                  <span className="font-mono">{formatCurrency(weekData?.hourlyPay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission ({weekData?.commissionRate}%):</span>
                  <span className="font-mono">{formatCurrency(weekData?.commission)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Base Pay (MAX):</span>
                  <span className="font-mono font-medium">{formatCurrency(weekData?.basePay)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center">
                <Icon name="Plus" size={16} className="mr-2 text-success" />
                Additional Earnings
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tips:</span>
                  <span className="font-mono text-success">{formatCurrency(weekData?.tips)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Addings:</span>
                  <span className="font-mono text-success">{formatCurrency(weekData?.addings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount Deduction:</span>
                  <span className="font-mono text-error">-{formatCurrency(weekData?.discountDeduction)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Week Total:</span>
                  <span className="font-mono font-medium text-primary">{formatCurrency(weekData?.totalPay)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyBreakdown;