import React from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const StepProgressIndicator = () => {
  const location = useLocation();

  const steps = [
    {
      id: 1,
      label: 'Upload Files',
      shortLabel: 'Upload',
      path: '/file-upload-dashboard',
      icon: 'Upload',
      description: 'Upload timecard data'
    },
    {
      id: 2,
      label: 'Configure & Adjust',
      shortLabel: 'Configure',
      path: '/employee-configuration',
      icon: 'Settings',
      description: 'Set employee pay rules'
    },
    {
      id: 3,
      label: 'Manual Adjustments',
      shortLabel: 'Adjust',
      path: '/manual-adjustments',
      icon: 'Edit',
      description: 'Make manual corrections'
    },
    {
      id: 4,
      label: 'Review Results',
      shortLabel: 'Results',
      path: '/payroll-summary-results',
      icon: 'BarChart3',
      description: 'View payroll summary'
    },
    {
      id: 5,
      label: 'Employee Details',
      shortLabel: 'Details',
      path: '/employee-detail-breakdown',
      icon: 'User',
      description: 'Detailed breakdown'
    }
  ];

  const getCurrentStepIndex = () => {
    const currentStep = steps?.findIndex(step => step?.path === location?.pathname);
    return currentStep >= 0 ? currentStep : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  const handleStepClick = (step, stepIndex) => {
    // Allow navigation to completed steps and current step
    if (stepIndex <= currentStepIndex) {
      window.location.href = step?.path;
    }
  };

  const isClickable = (stepIndex) => stepIndex <= currentStepIndex;

  return (
    <div className="bg-card border-b border-border sticky top-16 z-40">
      {/* Desktop Progress Indicator */}
      <div className="hidden lg:block px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps?.map((step, index) => {
            const status = getStepStatus(index);
            const clickable = isClickable(index);
            
            return (
              <div key={step?.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <Button
                    variant={status === 'current' ? 'default' : status === 'completed' ? 'secondary' : 'outline'}
                    size="icon"
                    onClick={() => handleStepClick(step, index)}
                    disabled={!clickable}
                    className={`w-12 h-12 rounded-full mb-2 transition-all duration-150 ${
                      clickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    {status === 'completed' ? (
                      <Icon name="Check" size={20} />
                    ) : (
                      <Icon name={step?.icon} size={20} />
                    )}
                  </Button>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${
                      status === 'current' ? 'text-primary' : 
                      status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step?.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {step?.description}
                    </div>
                  </div>
                </div>
                {index < steps?.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 mb-8 ${
                    index < currentStepIndex ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Mobile Progress Indicator */}
      <div className="lg:hidden px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-foreground">
            Step {currentStepIndex + 1} of {steps?.length}
          </div>
          <div className="text-xs text-muted-foreground">
            {Math.round(((currentStepIndex + 1) / steps?.length) * 100)}% Complete
          </div>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2 mb-3">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps?.length) * 100}%` }}
          />
        </div>
        
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Icon name={steps?.[currentStepIndex]?.icon} size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              {steps?.[currentStepIndex]?.label}
            </span>
          </div>
        </div>
      </div>
      {/* Tablet Progress Indicator */}
      <div className="hidden md:block lg:hidden px-4 py-3">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {steps?.map((step, index) => {
            const status = getStepStatus(index);
            const clickable = isClickable(index);
            
            return (
              <div key={step?.id} className="flex items-center flex-shrink-0">
                <Button
                  variant={status === 'current' ? 'default' : status === 'completed' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => handleStepClick(step, index)}
                  disabled={!clickable}
                  iconName={status === 'completed' ? 'Check' : step?.icon}
                  iconPosition="left"
                  iconSize={16}
                  className={`transition-all duration-150 ${
                    clickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  {step?.shortLabel}
                </Button>
                {index < steps?.length - 1 && (
                  <Icon 
                    name="ChevronRight" 
                    size={16} 
                    className={`mx-2 ${
                      index < currentStepIndex ? 'text-primary' : 'text-muted-foreground'
                    }`} 
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepProgressIndicator;