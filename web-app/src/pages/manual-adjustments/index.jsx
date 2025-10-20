import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import StepProgressIndicator from '../../components/ui/StepProgressIndicator';
import WorkflowActionBar from '../../components/ui/WorkflowActionBar';
import DataStatusIndicator from '../../components/ui/DataStatusIndicator';
import AdjustmentForm from './components/AdjustmentForm';
import AdjustmentsList from './components/AdjustmentsList';
import AdjustmentsSummary from './components/AdjustmentsSummary';
import Icon from '../../components/AppIcon';

const ManualAdjustments = () => {
  const navigate = useNavigate();
  const [adjustments, setAdjustments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dataStatus, setDataStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Mock employee data - in real app this would come from previous steps
  const employees = [
    {
      id: 'emp_001',
      name: 'Aubrie B',
      payType: '40% Commission vs $14/hr + Tips',
      department: 'Styling'
    },
    {
      id: 'emp_002', 
      name: 'Megan T',
      payType: '40% Commission vs $14/hr + Tips',
      department: 'Styling'
    },
    {
      id: 'emp_003',
      name: 'Hilda',
      payType: '50% Pure Commission + Tips',
      department: 'Styling'
    },
    {
      id: 'emp_004',
      name: 'Kennedi B',
      payType: '$14/hr Hourly Only',
      department: 'Styling'
    },
    {
      id: 'emp_005',
      name: 'Valerie C',
      payType: '$14/hr Hourly Only',
      department: 'Styling'
    },
    {
      id: 'emp_006',
      name: 'Erika Perez',
      payType: '$14/hr Hourly Only',
      department: 'Styling'
    },
    {
      id: 'emp_007',
      name: 'Stylist Chelese',
      payType: '$14/hr Hourly Only',
      department: 'Styling'
    }
  ];

  // Load saved adjustments on component mount
  useEffect(() => {
    const savedAdjustments = localStorage.getItem('salon_payroll_adjustments');
    if (savedAdjustments) {
      try {
        setAdjustments(JSON.parse(savedAdjustments));
      } catch (error) {
        console.error('Error loading saved adjustments:', error);
      }
    }
  }, []);

  // Auto-save adjustments when they change
  useEffect(() => {
    if (adjustments?.length > 0) {
      localStorage.setItem('salon_payroll_adjustments', JSON.stringify(adjustments));
    }
  }, [adjustments]);

  const handleAddAdjustment = async (adjustmentData) => {
    setIsSubmitting(true);
    setDataStatus('processing');
    setStatusMessage('Adding adjustment...');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAdjustments(prev => [...prev, adjustmentData]);
      
      setDataStatus('success');
      setStatusMessage(`${adjustmentData?.type === 'deduction' ? 'Deduction' : 'Bonus'} added successfully for ${adjustmentData?.employeeName}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDataStatus('idle');
        setStatusMessage('');
      }, 3000);
      
    } catch (error) {
      setDataStatus('error');
      setStatusMessage('Failed to add adjustment. Please try again.');
      console.error('Error adding adjustment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdjustment = async (adjustmentId) => {
    setDataStatus('processing');
    setStatusMessage('Removing adjustment...');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAdjustments(prev => prev?.filter(adj => adj?.id !== adjustmentId));
      
      setDataStatus('success');
      setStatusMessage('Adjustment removed successfully');
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setDataStatus('idle');
        setStatusMessage('');
      }, 2000);
      
    } catch (error) {
      setDataStatus('error');
      setStatusMessage('Failed to remove adjustment. Please try again.');
      console.error('Error removing adjustment:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setDataStatus('saved');
    setStatusMessage('Adjustments saved successfully');

    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (in real app would save to backend)
      localStorage.setItem('salon_payroll_adjustments', JSON.stringify(adjustments));
      localStorage.setItem('salon_payroll_adjustments_timestamp', new Date()?.toISOString());
      
    } catch (error) {
      setDataStatus('error');
      setStatusMessage('Failed to save adjustments');
      console.error('Error saving adjustments:', error);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setDataStatus('idle');
        setStatusMessage('');
      }, 2000);
    }
  };

  const handleNext = () => {
    // Save current state before proceeding
    handleSave();
    setTimeout(() => {
      navigate('/payroll-summary-results');
    }, 500);
  };

  const handlePrevious = () => {
    navigate('/employee-configuration');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StepProgressIndicator />
      
      <main className="container mx-auto px-6 py-8 pb-24">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
              <Icon name="Edit" size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Manual Adjustments</h1>
              <p className="text-muted-foreground">
                Add custom deductions, bonuses, and modifications to employee payroll
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <DataStatusIndicator 
            status={dataStatus}
            message={statusMessage}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Form and Summary */}
          <div className="xl:col-span-2 space-y-8">
            {/* Adjustment Form */}
            <AdjustmentForm
              employees={employees}
              onAddAdjustment={handleAddAdjustment}
              isSubmitting={isSubmitting}
            />

            {/* Adjustments Summary */}
            <AdjustmentsSummary
              adjustments={adjustments}
              employees={employees}
            />
          </div>

          {/* Right Column - Adjustments List */}
          <div className="xl:col-span-1">
            <div className="sticky top-32">
              <AdjustmentsList
                adjustments={adjustments}
                onDeleteAdjustment={handleDeleteAdjustment}
                employees={employees}
              />
            </div>
          </div>
        </div>

        {/* Instructions Panel */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Manual Adjustments Guidelines
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Deductions:</strong> Use for uniform costs, cash register shortages, or advance repayments</li>
                <li>• <strong>Bonuses:</strong> Use for performance incentives, holiday pay, or special recognition</li>
                <li>• <strong>Recurring:</strong> Check this option for adjustments that should apply to future pay periods</li>
                <li>• <strong>Documentation:</strong> Always provide clear descriptions for audit purposes</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <WorkflowActionBar
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSave={handleSave}
        isSaving={isSaving}
        isNextDisabled={false}
        isPreviousDisabled={false}
      />
    </div>
  );
};

export default ManualAdjustments;