import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Button from './Button';
import Icon from '../AppIcon';

const WorkflowActionBar = ({ 
  onNext, 
  onPrevious, 
  onSave, 
  isNextDisabled = false, 
  isPreviousDisabled = false, 
  isSaving = false,
  customActions = [] 
}) => {
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const getStepActions = () => {
    switch (location?.pathname) {
      case '/file-upload-dashboard':
        return {
          primary: { label: 'Process Files', icon: 'ArrowRight', action: onNext },
          secondary: { label: 'Save Draft', icon: 'Save', action: onSave },
          showPrevious: false
        };
      case '/employee-configuration':
        return {
          primary: { label: 'Continue to Adjustments', icon: 'ArrowRight', action: onNext },
          secondary: { label: 'Save Configuration', icon: 'Save', action: onSave },
          showPrevious: true
        };
      case '/manual-adjustments':
        return {
          primary: { label: 'Calculate Payroll', icon: 'Calculator', action: onNext },
          secondary: { label: 'Save Adjustments', icon: 'Save', action: onSave },
          showPrevious: true
        };
      case '/payroll-summary-results':
        return {
          primary: { label: 'View Details', icon: 'Eye', action: onNext },
          secondary: { label: 'Export Summary', icon: 'Download', action: () => handleExport('summary') },
          showPrevious: true
        };
      case '/employee-detail-breakdown':
        return {
          primary: { label: 'Export All', icon: 'Download', action: () => handleExport('all') },
          secondary: { label: 'Print Report', icon: 'Printer', action: () => handlePrint() },
          showPrevious: true
        };
      default:
        return {
          primary: { label: 'Continue', icon: 'ArrowRight', action: onNext },
          secondary: { label: 'Save', icon: 'Save', action: onSave },
          showPrevious: true
        };
    }
  };

  const handleExport = async (type) => {
    setIsProcessing(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Exporting ${type} data...`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const stepActions = getStepActions();

  return (
    <div className="bg-card border-t border-border sticky bottom-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Previous Button */}
          <div className="flex items-center space-x-2">
            {stepActions?.showPrevious && (
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={isPreviousDisabled}
                iconName="ArrowLeft"
                iconPosition="left"
                iconSize={16}
              >
                Previous
              </Button>
            )}
          </div>

          {/* Status Indicator */}
          <div className="hidden md:flex items-center space-x-4">
            {isSaving && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Loader2" size={16} className="animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            {isProcessing && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Loader2" size={16} className="animate-spin" />
                <span>Processing...</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Custom Actions */}
            {customActions?.map((action, index) => (
              <Button
                key={index}
                variant={action?.variant || 'outline'}
                size={action?.size || 'default'}
                onClick={action?.onClick}
                disabled={action?.disabled}
                loading={action?.loading}
                iconName={action?.icon}
                iconPosition={action?.iconPosition || 'left'}
                iconSize={16}
              >
                {action?.label}
              </Button>
            ))}

            {/* Secondary Action */}
            {stepActions?.secondary && (
              <Button
                variant="outline"
                onClick={stepActions?.secondary?.action}
                disabled={isSaving}
                loading={isSaving && stepActions?.secondary?.icon === 'Save'}
                iconName={stepActions?.secondary?.icon}
                iconPosition="left"
                iconSize={16}
                className="hidden sm:flex"
              >
                {stepActions?.secondary?.label}
              </Button>
            )}

            {/* Primary Action */}
            <Button
              variant="default"
              onClick={stepActions?.primary?.action}
              disabled={isNextDisabled || isProcessing}
              loading={isProcessing}
              iconName={stepActions?.primary?.icon}
              iconPosition="right"
              iconSize={16}
            >
              {stepActions?.primary?.label}
            </Button>
          </div>
        </div>

        {/* Mobile Secondary Actions */}
        <div className="sm:hidden mt-3 flex justify-center">
          {stepActions?.secondary && (
            <Button
              variant="ghost"
              size="sm"
              onClick={stepActions?.secondary?.action}
              disabled={isSaving}
              loading={isSaving && stepActions?.secondary?.icon === 'Save'}
              iconName={stepActions?.secondary?.icon}
              iconPosition="left"
              iconSize={16}
            >
              {stepActions?.secondary?.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowActionBar;