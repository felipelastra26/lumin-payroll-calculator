import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ManualAdjustments = ({ adjustments }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount) => `$${Math.abs(amount)?.toFixed(2)}`;
  
  const totalAdjustments = adjustments?.reduce((sum, adj) => sum + adj?.amount, 0);
  const hasAdjustments = adjustments?.length > 0;

  const getAdjustmentIcon = (type) => {
    switch (type) {
      case 'bonus': return 'TrendingUp';
      case 'deduction': return 'TrendingDown';
      case 'correction': return 'Edit';
      default: return 'DollarSign';
    }
  };

  const getAdjustmentColor = (amount) => {
    return amount >= 0 ? 'text-success' : 'text-error';
  };

  if (!hasAdjustments) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="Edit" size={20} className="text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Manual Adjustments</h3>
        </div>
        
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No manual adjustments applied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg mb-6">
      <div 
        className="flex items-center justify-between p-4 border-b border-border cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Icon name="Edit" size={20} className="text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Manual Adjustments</h3>
            <p className="text-sm text-muted-foreground">
              {adjustments?.length} adjustment{adjustments?.length !== 1 ? 's' : ''} • 
              <span className={`ml-1 ${getAdjustmentColor(totalAdjustments)}`}>
                {totalAdjustments >= 0 ? '+' : ''}{formatCurrency(totalAdjustments)}
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`font-mono font-medium ${getAdjustmentColor(totalAdjustments)}`}>
            {totalAdjustments >= 0 ? '+' : '-'}{formatCurrency(totalAdjustments)}
          </span>
          <Icon 
            name={isExpanded ? "ChevronUp" : "ChevronDown"} 
            size={20} 
            className="text-muted-foreground" 
          />
        </div>
      </div>
      {isExpanded && (
        <div className="p-4">
          <div className="space-y-3">
            {adjustments?.map((adjustment, index) => (
              <div key={index} className="bg-muted rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Icon 
                      name={getAdjustmentIcon(adjustment?.type)} 
                      size={16} 
                      className={getAdjustmentColor(adjustment?.amount)} 
                    />
                    <div>
                      <div className="font-medium text-foreground capitalize">{adjustment?.type}</div>
                      <div className="text-sm text-muted-foreground">{adjustment?.date}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-mono font-medium ${getAdjustmentColor(adjustment?.amount)}`}>
                      {adjustment?.amount >= 0 ? '+' : '-'}{formatCurrency(adjustment?.amount)}
                    </div>
                  </div>
                </div>
                
                {adjustment?.notes && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      <Icon name="MessageSquare" size={14} className="inline mr-1" />
                      {adjustment?.notes}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className={`mt-4 rounded-lg p-4 border ${
            totalAdjustments >= 0 
              ? 'bg-success/10 border-success/20' :'bg-error/10 border-error/20'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Icon 
                  name="Calculator" 
                  size={16} 
                  className={getAdjustmentColor(totalAdjustments)} 
                />
                <span className="font-medium text-foreground">Total Adjustments</span>
              </div>
              <span className={`font-mono font-bold text-lg ${getAdjustmentColor(totalAdjustments)}`}>
                {totalAdjustments >= 0 ? '+' : '-'}{formatCurrency(totalAdjustments)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualAdjustments;