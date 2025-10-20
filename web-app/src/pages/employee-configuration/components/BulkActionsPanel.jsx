import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const BulkActionsPanel = ({ employees, onBulkUpdate, onApplyTemplate }) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [bulkData, setBulkData] = useState({
    payStructure: '',
    commissionRate: '',
    hourlyRate: ''
  });
  const [isApplying, setIsApplying] = useState(false);

  const actionOptions = [
    { value: 'update_commission', label: 'Update Commission Rate', description: 'Change commission percentage for selected employees' },
    { value: 'update_hourly', label: 'Update Hourly Rate', description: 'Change hourly rate for selected employees' },
    { value: 'change_structure', label: 'Change Pay Structure', description: 'Switch between commission/hourly/mixed structures' },
    { value: 'apply_template', label: 'Apply Template', description: 'Apply predefined pay structure template' }
  ];

  const payStructureOptions = [
    { value: 'commission_vs_hourly', label: 'Commission vs Hourly (MAX)' },
    { value: 'pure_commission', label: 'Pure Commission Only' },
    { value: 'hourly_only', label: 'Hourly Only' }
  ];

  const templateOptions = [
    { value: 'stylist_standard', label: 'Standard Stylist (40% vs $14/hr)', description: 'Aubrie B & Megan T template' },
    { value: 'senior_stylist', label: 'Senior Stylist (50% commission)', description: 'Hilda template' },
    { value: 'hourly_staff', label: 'Hourly Staff ($14/hr)', description: 'Support staff template' }
  ];

  const handleEmployeeSelect = (employeeId, checked) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      setSelectedEmployees(selectedEmployees?.filter(id => id !== employeeId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEmployees(employees?.map(emp => emp?.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleApplyChanges = async () => {
    if (selectedEmployees?.length === 0) return;
    
    setIsApplying(true);
    try {
      if (selectedAction === 'apply_template') {
        await onApplyTemplate(selectedEmployees, bulkData?.template);
      } else {
        await onBulkUpdate(selectedEmployees, selectedAction, bulkData);
      }
      
      // Reset form
      setSelectedEmployees([]);
      setSelectedAction('');
      setBulkData({ payStructure: '', commissionRate: '', hourlyRate: '' });
    } catch (error) {
      console.error('Bulk update failed:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const isFormValid = () => {
    return selectedEmployees?.length > 0 && selectedAction && (
      (selectedAction === 'update_commission' && bulkData?.commissionRate) ||
      (selectedAction === 'update_hourly' && bulkData?.hourlyRate) ||
      (selectedAction === 'change_structure' && bulkData?.payStructure) ||
      (selectedAction === 'apply_template' && bulkData?.template)
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Icon name="Users" size={20} className="text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Bulk Actions</h3>
            <p className="text-sm text-muted-foreground">Update multiple employees at once</p>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {selectedEmployees?.length} of {employees?.length} selected
        </div>
      </div>
      {/* Employee Selection */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-foreground">Select Employees</h4>
          <Checkbox
            label="Select All"
            checked={selectedEmployees?.length === employees?.length}
            onChange={(e) => handleSelectAll(e?.target?.checked)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {employees?.map((employee) => (
            <div key={employee?.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <Checkbox
                checked={selectedEmployees?.includes(employee?.id)}
                onChange={(e) => handleEmployeeSelect(employee?.id, e?.target?.checked)}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{employee?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {employee?.payStructure === 'commission_vs_hourly' && `${employee?.commissionRate}% vs $${employee?.hourlyRate}/hr`}
                  {employee?.payStructure === 'pure_commission' && `${employee?.commissionRate}% Commission`}
                  {employee?.payStructure === 'hourly_only' && `$${employee?.hourlyRate}/hr`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Action Configuration */}
      <div className="p-6">
        <div className="space-y-4">
          <Select
            label="Bulk Action"
            options={actionOptions}
            value={selectedAction}
            onChange={setSelectedAction}
            placeholder="Choose an action"
          />

          {selectedAction === 'update_commission' && (
            <Input
              label="New Commission Rate (%)"
              type="number"
              min="0"
              max="100"
              value={bulkData?.commissionRate}
              onChange={(e) => setBulkData({ ...bulkData, commissionRate: e?.target?.value })}
              placeholder="Enter commission percentage"
            />
          )}

          {selectedAction === 'update_hourly' && (
            <Input
              label="New Hourly Rate ($)"
              type="number"
              min="0"
              step="0.01"
              value={bulkData?.hourlyRate}
              onChange={(e) => setBulkData({ ...bulkData, hourlyRate: e?.target?.value })}
              placeholder="Enter hourly rate"
            />
          )}

          {selectedAction === 'change_structure' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="New Pay Structure"
                options={payStructureOptions}
                value={bulkData?.payStructure}
                onChange={(value) => setBulkData({ ...bulkData, payStructure: value })}
                placeholder="Choose pay structure"
              />
              
              {bulkData?.payStructure === 'commission_vs_hourly' && (
                <>
                  <Input
                    label="Commission Rate (%)"
                    type="number"
                    min="0"
                    max="100"
                    value={bulkData?.commissionRate}
                    onChange={(e) => setBulkData({ ...bulkData, commissionRate: e?.target?.value })}
                  />
                  <Input
                    label="Hourly Rate ($)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={bulkData?.hourlyRate}
                    onChange={(e) => setBulkData({ ...bulkData, hourlyRate: e?.target?.value })}
                  />
                </>
              )}
            </div>
          )}

          {selectedAction === 'apply_template' && (
            <Select
              label="Template"
              options={templateOptions}
              value={bulkData?.template}
              onChange={(value) => setBulkData({ ...bulkData, template: value })}
              placeholder="Choose a template"
            />
          )}

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedEmployees([]);
                setSelectedAction('');
                setBulkData({ payStructure: '', commissionRate: '', hourlyRate: '' });
              }}
              disabled={isApplying}
            >
              Clear Selection
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleApplyChanges}
              disabled={!isFormValid() || isApplying}
              loading={isApplying}
              iconName="Check"
              iconPosition="left"
              iconSize={16}
            >
              Apply to {selectedEmployees?.length} Employee{selectedEmployees?.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsPanel;