import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const AdjustmentForm = ({ employees, onAddAdjustment, isSubmitting }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'deduction',
    amount: '',
    description: '',
    isRecurring: false
  });
  const [errors, setErrors] = useState({});

  const adjustmentTypes = [
    { value: 'deduction', label: 'Deduction', description: 'Subtract from pay' },
    { value: 'bonus', label: 'Bonus', description: 'Add to pay' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.employeeId) {
      newErrors.employeeId = 'Please select an employee';
    }
    
    if (!formData?.amount || parseFloat(formData?.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than $0';
    }
    
    if (!formData?.description?.trim()) {
      newErrors.description = 'Please provide a description for this adjustment';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const adjustmentData = {
      id: Date.now()?.toString(),
      employeeId: formData?.employeeId,
      employeeName: employees?.find(emp => emp?.id === formData?.employeeId)?.name || '',
      type: formData?.type,
      amount: parseFloat(formData?.amount),
      description: formData?.description?.trim(),
      isRecurring: formData?.isRecurring,
      dateAdded: new Date()?.toISOString(),
      addedBy: 'Current User'
    };

    onAddAdjustment(adjustmentData);
    
    // Reset form
    setFormData({
      employeeId: '',
      type: 'deduction',
      amount: '',
      description: '',
      isRecurring: false
    });
    setErrors({});
  };

  const handleAmountChange = (e) => {
    const value = e?.target?.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/?.test(value)) {
      setFormData(prev => ({ ...prev, amount: value }));
      if (errors?.amount) {
        setErrors(prev => ({ ...prev, amount: '' }));
      }
    }
  };

  const formatAmount = (value) => {
    if (!value) return '';
    const num = parseFloat(value);
    return isNaN(num) ? value : num?.toFixed(2);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
          <Icon name="Plus" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Add Manual Adjustment</h2>
          <p className="text-sm text-muted-foreground">
            Add deductions or bonuses to employee payroll
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Selection */}
        <Select
          label="Select Employee"
          description="Choose the employee for this adjustment"
          options={employees?.map(emp => ({
            value: emp?.id,
            label: emp?.name,
            description: emp?.payType
          }))}
          value={formData?.employeeId}
          onChange={(value) => {
            setFormData(prev => ({ ...prev, employeeId: value }));
            if (errors?.employeeId) {
              setErrors(prev => ({ ...prev, employeeId: '' }));
            }
          }}
          placeholder="Choose employee..."
          error={errors?.employeeId}
          required
          searchable
        />

        {/* Adjustment Type */}
        <Select
          label="Adjustment Type"
          description="Select whether this is a deduction or bonus"
          options={adjustmentTypes}
          value={formData?.type}
          onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
          required
        />

        {/* Amount Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="text"
            placeholder="0.00"
            value={formData?.amount}
            onChange={handleAmountChange}
            onBlur={(e) => {
              const formatted = formatAmount(e?.target?.value);
              setFormData(prev => ({ ...prev, amount: formatted }));
            }}
            error={errors?.amount}
            description="Enter amount in USD"
            required
            className="font-mono"
          />
          
          <div className="flex items-end">
            <div className={`px-4 py-2 rounded-lg border-2 border-dashed h-11 flex items-center ${
              formData?.type === 'deduction' ?'border-red-200 bg-red-50 text-red-700' :'border-green-200 bg-green-50 text-green-700'
            }`}>
              <Icon 
                name={formData?.type === 'deduction' ? 'Minus' : 'Plus'} 
                size={16} 
                className="mr-2" 
              />
              <span className="text-sm font-medium">
                {formData?.amount ? `$${formData?.amount}` : '$0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <Input
          label="Description / Notes"
          type="text"
          placeholder="Enter reason for adjustment..."
          value={formData?.description}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, description: e?.target?.value }));
            if (errors?.description) {
              setErrors(prev => ({ ...prev, description: '' }));
            }
          }}
          error={errors?.description}
          description="Provide details about this adjustment"
          required
          maxLength={200}
        />

        {/* Recurring Option */}
        <Checkbox
          label="Recurring Adjustment"
          description="Apply this adjustment to future pay periods"
          checked={formData?.isRecurring}
          onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e?.target?.checked }))}
        />

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {formData?.employeeId && formData?.amount && (
              <span>
                {formData?.type === 'deduction' ? 'Deducting' : 'Adding'} ${formData?.amount} 
                {formData?.employeeId && ` for ${employees?.find(emp => emp?.id === formData?.employeeId)?.name}`}
              </span>
            )}
          </div>
          
          <Button
            type="submit"
            variant="default"
            loading={isSubmitting}
            disabled={!formData?.employeeId || !formData?.amount || !formData?.description?.trim()}
            iconName="Plus"
            iconPosition="left"
            iconSize={16}
          >
            {isSubmitting ? 'Adding...' : 'Add Adjustment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdjustmentForm;