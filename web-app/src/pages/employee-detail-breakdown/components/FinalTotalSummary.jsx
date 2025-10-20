import React from 'react';
import Icon from '../../../components/AppIcon';

const FinalTotalSummary = ({ summaryData }) => {
  const formatCurrency = (amount) => `$${amount?.toFixed(2)}`;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="Calculator" size={24} className="text-primary" />
        <h3 className="text-xl font-bold text-foreground">Final Pay Calculation</h3>
      </div>
      <div className="space-y-4">
        {/* Week Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                <span className="font-medium text-blue-800">Week 1 Total</span>
              </div>
              <span className="font-mono font-bold text-blue-800">{formatCurrency(summaryData?.week1Total)}</span>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                <span className="font-medium text-green-800">Week 2 Total</span>
              </div>
              <span className="font-mono font-bold text-green-800">{formatCurrency(summaryData?.week2Total)}</span>
            </div>
          </div>
        </div>

        {/* Calculation Steps */}
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-3 flex items-center">
            <Icon name="List" size={16} className="mr-2" />
            Calculation Breakdown
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Week 1 Subtotal:</span>
              <span className="font-mono">{formatCurrency(summaryData?.week1Total)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Week 2 Subtotal:</span>
              <span className="font-mono">{formatCurrency(summaryData?.week2Total)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Bi-weekly Subtotal:</span>
              <span className="font-mono">{formatCurrency(summaryData?.biweeklySubtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`${summaryData?.totalAdjustments >= 0 ? 'text-success' : 'text-error'}`}>
                Manual Adjustments:
              </span>
              <span className={`font-mono ${summaryData?.totalAdjustments >= 0 ? 'text-success' : 'text-error'}`}>
                {summaryData?.totalAdjustments >= 0 ? '+' : ''}{formatCurrency(summaryData?.totalAdjustments)}
              </span>
            </div>
            
            <div className="border-t border-border pt-2 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Final Total Pay:</span>
                <span className="font-mono font-bold text-primary text-lg">{formatCurrency(summaryData?.finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pay Structure Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <Icon name="Clock" size={20} className="text-warning mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Total Hours</div>
            <div className="font-bold text-foreground">{summaryData?.totalHours}</div>
          </div>
          
          <div className="text-center p-4 bg-muted rounded-lg">
            <Icon name="Percent" size={20} className="text-primary mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Commission Rate</div>
            <div className="font-bold text-foreground">{summaryData?.commissionRate}%</div>
          </div>
          
          <div className="text-center p-4 bg-muted rounded-lg">
            <Icon name="DollarSign" size={20} className="text-success mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Hourly Rate</div>
            <div className="font-bold text-foreground">{formatCurrency(summaryData?.hourlyRate)}</div>
          </div>
        </div>

        {/* Mathematical Formula */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <h5 className="font-medium text-foreground mb-2 flex items-center">
            <Icon name="Calculator" size={16} className="mr-2 text-primary" />
            Pay Formula Applied
          </h5>
          <div className="text-sm text-muted-foreground font-mono">
            Final Pay = (Week 1 + Week 2) + Manual Adjustments
            <br />
            Where Weekly Pay = MAX(Hourly, Commission) + Tips + Addings - (Discounts × 50%)
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalTotalSummary;