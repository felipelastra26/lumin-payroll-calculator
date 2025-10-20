import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AddingsBreakdown = ({ addingsData, weekNumber }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount) => `$${amount?.toFixed(2)}`;

  return (
    <div className="bg-card border border-border rounded-lg mb-4">
      <div 
        className="flex items-center justify-between p-4 border-b border-border cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Icon name="PlusCircle" size={20} className="text-success" />
          <div>
            <h4 className="font-medium text-foreground">Week {weekNumber} Addings</h4>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(addingsData?.total)} total addings
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="font-mono font-medium text-success">{formatCurrency(addingsData?.total)}</span>
          <Icon 
            name={isExpanded ? "ChevronUp" : "ChevronDown"} 
            size={20} 
            className="text-muted-foreground" 
          />
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Sets */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="Star" size={16} className="text-warning" />
                <h5 className="font-medium text-foreground">Full Sets</h5>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Count:</span>
                  <span className="font-mono">{addingsData?.fullSets?.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-mono">{formatCurrency(addingsData?.fullSets?.rate)} each</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-mono font-medium text-success">{formatCurrency(addingsData?.fullSets?.total)}</span>
                </div>
              </div>

              {addingsData?.fullSets?.details?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-2">Details:</div>
                  <div className="space-y-1">
                    {addingsData?.fullSets?.details?.map((detail, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{detail?.date} - {detail?.client}</span>
                        <span className="font-mono">{formatCurrency(detail?.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Refills */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="RefreshCw" size={16} className="text-primary" />
                <h5 className="font-medium text-foreground">Refills (Non-Member)</h5>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Count:</span>
                  <span className="font-mono">{addingsData?.refills?.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-mono">{formatCurrency(addingsData?.refills?.rate)} each</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-mono font-medium text-success">{formatCurrency(addingsData?.refills?.total)}</span>
                </div>
              </div>

              {addingsData?.refills?.details?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-2">Details:</div>
                  <div className="space-y-1">
                    {addingsData?.refills?.details?.map((detail, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{detail?.date} - {detail?.client}</span>
                        <span className="font-mono">{formatCurrency(detail?.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-success/10 rounded-lg p-4 border border-success/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Icon name="Calculator" size={16} className="text-success" />
                <span className="font-medium text-foreground">Total Addings</span>
              </div>
              <span className="font-mono font-bold text-success text-lg">{formatCurrency(addingsData?.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddingsBreakdown;