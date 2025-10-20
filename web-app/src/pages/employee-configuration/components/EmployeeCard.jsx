import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const EmployeeCard = ({ employee, onUpdate, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    payStructure: employee?.payStructure,
    commissionRate: employee?.commissionRate,
    hourlyRate: employee?.hourlyRate,
    specialRules: employee?.specialRules
  });

  const payStructureOptions = [
    { value: 'commission_vs_hourly', label: 'Commission vs Hourly (MAX)', description: 'Uses higher of commission or hourly' },
    { value: 'pure_commission', label: 'Pure Commission Only', description: 'Commission-based pay only' },
    { value: 'hourly_only', label: 'Hourly Only', description: 'Fixed hourly rate only' }
  ];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      payStructure: employee?.payStructure,
      commissionRate: employee?.commissionRate,
      hourlyRate: employee?.hourlyRate,
      specialRules: employee?.specialRules
    });
  };

  const handleSave = () => {
    onUpdate(employee?.id, editData);
    onSave(employee?.id);
    setIsEditing(false);
  };

  const getPayStructureDisplay = () => {
    switch (employee?.payStructure) {
      case 'commission_vs_hourly':
        return `${employee?.commissionRate}% Commission vs $${employee?.hourlyRate}/hr`;
      case 'pure_commission':
        return `${employee?.commissionRate}% Pure Commission`;
      case 'hourly_only':
        return `$${employee?.hourlyRate}/hr Only`;
      default:
        return 'Not configured';
    }
  };

  const getStatusColor = () => {
    return employee?.isConfigured ? 'text-success' : 'text-warning';
  };

  const getStatusIcon = () => {
    return employee?.isConfigured ? 'CheckCircle' : 'AlertCircle';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-150">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="User" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{employee?.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Icon name={getStatusIcon()} size={16} className={getStatusColor()} />
              <span className={`text-sm ${getStatusColor()}`}>
                {employee?.isConfigured ? 'Configured' : 'Needs Setup'}
              </span>
            </div>
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
            Edit
          </Button>
        )}
      </div>
      {/* Pay Structure Display/Edit */}
      {!isEditing ? (
        <div className="space-y-3">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground mb-1">Pay Structure</div>
                <div className="text-lg font-semibold text-primary">
                  {getPayStructureDisplay()}
                </div>
              </div>
              <Icon name="DollarSign" size={24} className="text-muted-foreground" />
            </div>
          </div>

          {employee?.specialRules && employee?.specialRules?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Icon name="Info" size={16} className="text-amber-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-amber-800">Special Rules</div>
                  <ul className="text-xs text-amber-700 mt-1 space-y-1">
                    {employee?.specialRules?.map((rule, index) => (
                      <li key={index}>• {rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Select
            label="Pay Structure Type"
            options={payStructureOptions}
            value={editData?.payStructure}
            onChange={(value) => setEditData({ ...editData, payStructure: value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(editData?.payStructure === 'commission_vs_hourly' || editData?.payStructure === 'pure_commission') && (
              <Input
                label="Commission Rate (%)"
                type="number"
                min="0"
                max="100"
                value={editData?.commissionRate}
                onChange={(e) => setEditData({ ...editData, commissionRate: parseFloat(e?.target?.value) })}
                placeholder="Enter commission percentage"
              />
            )}

            {(editData?.payStructure === 'commission_vs_hourly' || editData?.payStructure === 'hourly_only') && (
              <Input
                label="Hourly Rate ($)"
                type="number"
                min="0"
                step="0.01"
                value={editData?.hourlyRate}
                onChange={(e) => setEditData({ ...editData, hourlyRate: parseFloat(e?.target?.value) })}
                placeholder="Enter hourly rate"
              />
            )}
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
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCard;