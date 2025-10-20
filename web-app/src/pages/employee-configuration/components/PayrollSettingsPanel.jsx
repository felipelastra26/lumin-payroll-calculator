import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const PayrollSettingsPanel = ({ settings, onUpdate, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullSetAdding: settings?.fullSetAdding,
    refillAdding: settings?.refillAdding,
    discountDeduction: settings?.discountDeduction,
    tipCalculation: settings?.tipCalculation
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      fullSetAdding: settings?.fullSetAdding,
      refillAdding: settings?.refillAdding,
      discountDeduction: settings?.discountDeduction,
      tipCalculation: settings?.tipCalculation
    });
  };

  const handleSave = () => {
    onUpdate(editData);
    onSave();
    setIsEditing(false);
  };

  const settingsItems = [
    {
      label: 'Full Set Adding',
      value: `$${settings?.fullSetAdding}`,
      description: 'Additional pay per full set service',
      icon: 'Plus'
    },
    {
      label: 'Refill Adding (Non-Member)',
      value: `$${settings?.refillAdding}`,
      description: 'Additional pay per refill for non-members',
      icon: 'RefreshCw'
    },
    {
      label: 'Discount Deduction',
      value: `${settings?.discountDeduction}%`,
      description: 'Percentage of discount deducted from pay',
      icon: 'Minus'
    },
    {
      label: 'Tip Calculation',
      value: settings?.tipCalculation,
      description: 'How tips are calculated and added',
      icon: 'Heart'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Settings" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Payroll Settings</h3>
            <p className="text-sm text-muted-foreground">Configure global calculation rules</p>
          </div>
        </div>
        
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            iconName="Edit"
            iconPosition="left"
            iconSize={16}
          >
            Edit Settings
          </Button>
        )}
      </div>
      {/* Settings Content */}
      <div className="p-6">
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settingsItems?.map((item, index) => (
              <div key={index} className="bg-muted rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={item?.icon} size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{item?.label}</div>
                    <div className="text-lg font-semibold text-primary mt-1">{item?.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item?.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Set Adding ($)"
                type="number"
                min="0"
                step="0.01"
                value={editData?.fullSetAdding}
                onChange={(e) => setEditData({ ...editData, fullSetAdding: parseFloat(e?.target?.value) })}
                description="Additional pay per full set service"
              />

              <Input
                label="Refill Adding ($)"
                type="number"
                min="0"
                step="0.01"
                value={editData?.refillAdding}
                onChange={(e) => setEditData({ ...editData, refillAdding: parseFloat(e?.target?.value) })}
                description="Additional pay per refill for non-members"
              />

              <Input
                label="Discount Deduction (%)"
                type="number"
                min="0"
                max="100"
                value={editData?.discountDeduction}
                onChange={(e) => setEditData({ ...editData, discountDeduction: parseFloat(e?.target?.value) })}
                description="Percentage of discount deducted from pay"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-blue-800">Tip Calculation</div>
                    <div className="text-xs text-blue-700 mt-1">
                      Tips are added directly to employee pay without deductions
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                iconName="Save"
                iconPosition="left"
                iconSize={16}
              >
                Save Settings
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Calculation Formula */}
      <div className="px-6 pb-6">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Icon name="Calculator" size={16} className="text-slate-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-slate-800 mb-2">Payroll Calculation Formula</div>
              <div className="text-xs text-slate-700 font-mono bg-white rounded px-2 py-1 border">
                Weekly Pay = MAX(Hourly, Commission) + Tips + Addings - (Discounts × {settings?.discountDeduction}%)
              </div>
              <div className="text-xs text-slate-600 mt-2">
                Final Pay = Week 1 Total + Week 2 Total
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollSettingsPanel;