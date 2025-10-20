import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import StepProgressIndicator from '../../components/ui/StepProgressIndicator';
import WorkflowActionBar from '../../components/ui/WorkflowActionBar';
import DataStatusIndicator from '../../components/ui/DataStatusIndicator';
import FileUploadZone from './components/FileUploadZone';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { getServiceProviders } from '../../services/azureService';
import { parseTimecardFile } from '../../services/payrollService';

const FileUploadDashboard = () => {
  const navigate = useNavigate();
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [currentFile, setCurrentFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  
  // Pay period configuration
  const [payPeriodStart, setPayPeriodStart] = useState('');
  const [payPeriodEnd, setPayPeriodEnd] = useState('');
  const [payDate, setPayDate] = useState('');
  
  // Employees from Azure
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Load employees from Azure on mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const serviceProviders = await getServiceProviders();
      setEmployees(serviceProviders);
      setStatusMessage(`Loaded ${serviceProviders.length} employees from Azure`);
    } catch (error) {
      setStatusMessage('Error loading employees from Azure');
      console.error(error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleFileUpload = async (file) => {
    setCurrentFile(file);
    setUploadStatus('uploading');
    setStatusMessage('Uploading and parsing timecard...');
    setIsProcessingComplete(false);

    try {
      // Parse the timecard file
      const timecardData = await parseTimecardFile(file);
      
      // Store in session storage for next steps
      sessionStorage.setItem('timecardData', JSON.stringify(timecardData));
      sessionStorage.setItem('timecardFileName', file.name);
      
      setUploadStatus('success');
      setStatusMessage('Timecard uploaded and parsed successfully!');
      setIsProcessingComplete(true);

    } catch (error) {
      setUploadStatus('error');
      setStatusMessage('Failed to parse timecard. Please check the file format.');
      console.error('Upload error:', error);
    }
  };

  const handleNext = () => {
    if (!isProcessingComplete) {
      setStatusMessage('Please upload a timecard file first');
      return;
    }
    
    if (!payPeriodStart || !payPeriodEnd) {
      setStatusMessage('Please select pay period dates');
      return;
    }
    
    if (!payDate) {
      setStatusMessage('Please select pay date');
      return;
    }
    
    // Store configuration
    sessionStorage.setItem('payPeriod', JSON.stringify({
      startDate: payPeriodStart,
      endDate: payPeriodEnd,
      payDate: payDate
    }));
    
    sessionStorage.setItem('employees', JSON.stringify(employees));
    
    navigate('/payroll-summary-results');
  };

  const isReadyToCalculate = isProcessingComplete && payPeriodStart && payPeriodEnd && payDate;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StepProgressIndicator />
      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Lumin Salon Payroll Calculator</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload your timecard Excel file and configure pay period to calculate payroll automatically.
            </p>
          </div>

          {/* Status Indicator */}
          <DataStatusIndicator 
            status={uploadStatus}
            message={statusMessage}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: File Upload */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Upload" size={24} className="mr-2" />
                  Step 1: Upload Timecard
                </h2>
                
                <FileUploadZone 
                  onFileUpload={handleFileUpload}
                  isUploading={uploadStatus === 'uploading' || uploadStatus === 'processing'}
                />
                
                {currentFile && uploadStatus === 'success' && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Icon name="CheckCircle" size={20} className="text-success" />
                      <div>
                        <p className="text-sm font-medium text-green-800">{currentFile.name}</p>
                        <p className="text-xs text-green-700">
                          {(currentFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Employees Loaded */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="Users" size={20} className="mr-2" />
                  Employees Loaded from Azure
                </h3>
                
                {loadingEmployees ? (
                  <p className="text-sm text-muted-foreground">Loading employees...</p>
                ) : employees.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      {employees.length} active employees found
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {employees.map(emp => (
                        <div key={emp.id} className="text-sm text-foreground flex items-center">
                          <Icon name="CheckCircle" size={14} className="text-success mr-2" />
                          {emp.fullName}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No employees found</p>
                )}
              </div>
            </div>

            {/* Right Column: Pay Period Configuration */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Calendar" size={24} className="mr-2" />
                  Step 2: Configure Pay Period
                </h2>
                
                <div className="space-y-4">
                  {/* Pay Period Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Pay Period Start Date
                    </label>
                    <Input
                      type="date"
                      value={payPeriodStart}
                      onChange={(e) => setPayPeriodStart(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Pay Period End Date */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Pay Period End Date
                    </label>
                    <Input
                      type="date"
                      value={payPeriodEnd}
                      onChange={(e) => setPayPeriodEnd(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Pay Date */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Pay Date
                    </label>
                    <Input
                      type="date"
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Typically one week after pay period ends
                    </p>
                  </div>

                  {/* Quick Fill Buttons */}
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-2">Quick fill for current period:</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Calculate current pay period (assuming bi-weekly, ending on Friday)
                        const today = new Date();
                        const dayOfWeek = today.getDay();
                        const daysToFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 5 - dayOfWeek + 7;
                        
                        const endDate = new Date(today);
                        endDate.setDate(today.getDate() + daysToFriday);
                        
                        const startDate = new Date(endDate);
                        startDate.setDate(endDate.getDate() - 13);
                        
                        const payDateCalc = new Date(endDate);
                        payDateCalc.setDate(endDate.getDate() + 7);
                        
                        setPayPeriodStart(startDate.toISOString().split('T')[0]);
                        setPayPeriodEnd(endDate.toISOString().split('T')[0]);
                        setPayDate(payDateCalc.toISOString().split('T')[0]);
                      }}
                    >
                      Use Current Period
                    </Button>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {payPeriodStart && payPeriodEnd && payDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Pay Period Summary</h3>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p><strong>Period:</strong> {new Date(payPeriodStart).toLocaleDateString()} - {new Date(payPeriodEnd).toLocaleDateString()}</p>
                    <p><strong>Pay Date:</strong> {new Date(payDate).toLocaleDateString()}</p>
                    <p><strong>Employees:</strong> {employees.length}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!isReadyToCalculate}
              iconName="Calculator"
              iconPosition="left"
              className="px-8"
            >
              Calculate Payroll
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FileUploadDashboard;

