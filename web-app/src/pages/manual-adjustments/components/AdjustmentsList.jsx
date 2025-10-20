import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const AdjustmentsList = ({ adjustments, onDeleteAdjustment, employees }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (adjustmentId) => {
    setDeletingId(adjustmentId);
    try {
      await onDeleteAdjustment(adjustmentId);
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAdjustmentIcon = (type) => {
    return type === 'deduction' ? 'Minus' : 'Plus';
  };

  const getAdjustmentColor = (type) => {
    return type === 'deduction' ?'text-red-600 bg-red-50 border-red-200' :'text-green-600 bg-green-50 border-green-200';
  };

  if (adjustments?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
            <Icon name="FileText" size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Adjustments Added</h3>
          <p className="text-muted-foreground mb-4">
            Manual adjustments will appear here once you add them using the form above.
          </p>
          <div className="text-sm text-muted-foreground">
            Use adjustments for bonuses, deductions, or special circumstances.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
            <Icon name="List" size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Current Adjustments</h2>
            <p className="text-sm text-muted-foreground">
              {adjustments?.length} adjustment{adjustments?.length !== 1 ? 's' : ''} pending
            </p>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Total: {adjustments?.reduce((sum, adj) => 
            sum + (adj?.type === 'deduction' ? -adj?.amount : adj?.amount), 0
          )?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </div>
      </div>
      {/* Adjustments List */}
      <div className="divide-y divide-border">
        {adjustments?.map((adjustment) => (
          <div key={adjustment?.id} className="p-4 hover:bg-muted/50 transition-colors duration-150">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${getAdjustmentColor(adjustment?.type)}`}>
                    <Icon 
                      name={getAdjustmentIcon(adjustment?.type)} 
                      size={14} 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {adjustment?.employeeName}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        adjustment?.type === 'deduction' ?'bg-red-100 text-red-800' :'bg-green-100 text-green-800'
                      }`}>
                        {adjustment?.type === 'deduction' ? 'Deduction' : 'Bonus'}
                      </span>
                      {adjustment?.isRecurring && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Icon name="Repeat" size={12} className="mr-1" />
                          Recurring
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-lg font-semibold ${
                        adjustment?.type === 'deduction' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {adjustment?.type === 'deduction' ? '-' : '+'}
                        {formatCurrency(adjustment?.amount)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(adjustment?.dateAdded)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-11">
                  <p className="text-sm text-muted-foreground">
                    {adjustment?.description}
                  </p>
                  {adjustment?.addedBy && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Added by {adjustment?.addedBy}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(adjustment?.id)}
                  loading={deletingId === adjustment?.id}
                  disabled={deletingId === adjustment?.id}
                  iconName="Trash2"
                  iconSize={16}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdjustmentsList;