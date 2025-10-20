import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import StepProgressIndicator from '../../components/ui/StepProgressIndicator';
import WorkflowActionBar from '../../components/ui/WorkflowActionBar';
import DataStatusIndicator from '../../components/ui/DataStatusIndicator';
import PayrollSummaryCard from './components/PayrollSummaryCard';
import EmployeePayrollTable from './components/EmployeePayrollTable';
import ExportActionsPanel from './components/ExportActionsPanel';
import PayrollMetrics from './components/PayrollMetrics';

const PayrollSummaryResults = () => {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('idle');

  // Mock payroll data
  const payrollData = {
    totalPayroll: 8247.50,
    employeeCount: 7,
    dateRange: "Oct 7 - Oct 20, 2024",
    calculationDate: new Date()?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    employees: [
      {
        id: 1,
        name: "Aubrie B",
        position: "Senior Stylist",
        payStructure: "Mixed",
        totalPay: 1456.75,
        week1Pay: 728.50,
        week2Pay: 728.25,
        commissionRate: 0.40,
        hourlyRate: 14.00
      },
      {
        id: 2,
        name: "Megan T",
        position: "Senior Stylist", 
        payStructure: "Mixed",
        totalPay: 1389.25,
        week1Pay: 695.00,
        week2Pay: 694.25,
        commissionRate: 0.40,
        hourlyRate: 14.00
      },
      {
        id: 3,
        name: "Hilda",
        position: "Master Stylist",
        payStructure: "Commission",
        totalPay: 1678.50,
        week1Pay: 842.25,
        week2Pay: 836.25,
        commissionRate: 0.50,
        hourlyRate: 0.00
      },
      {
        id: 4,
        name: "Kennedi B",
        position: "Stylist",
        payStructure: "Hourly",
        totalPay: 1120.00,
        week1Pay: 560.00,
        week2Pay: 560.00,
        commissionRate: 0.00,
        hourlyRate: 14.00
      },
      {
        id: 5,
        name: "Valerie C",
        position: "Stylist",
        payStructure: "Hourly",
        totalPay: 1120.00,
        week1Pay: 560.00,
        week2Pay: 560.00,
        commissionRate: 0.00,
        hourlyRate: 14.00
      },
      {
        id: 6,
        name: "Erika Perez",
        position: "Stylist",
        payStructure: "Hourly",
        totalPay: 1120.00,
        week1Pay: 560.00,
        week2Pay: 560.00,
        commissionRate: 0.00,
        hourlyRate: 14.00
      },
      {
        id: 7,
        name: "Stylist Chelese",
        position: "Stylist",
        payStructure: "Hourly",
        totalPay: 1363.00,
        week1Pay: 681.50,
        week2Pay: 681.50,
        commissionRate: 0.00,
        hourlyRate: 14.00
      }
    ]
  };

  const payrollMetrics = {
    totalCommission: 3067.75,
    totalHourly: 4723.00,
    totalTips: 456.75,
    totalAddings: 287.50
  };

  useEffect(() => {
    // Simulate data loading
    setExportStatus('success');
  }, []);

  const handleViewDetails = (employeeId) => {
    navigate(`/employee-detail-breakdown?employee=${employeeId}`);
  };

  const handleExport = async (type) => {
    setIsExporting(true);
    setExportStatus('processing');
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (type) {
        case 'pdf': console.log('Generating PDF report...');
          break;
        case 'excel': console.log('Generating Excel file...');
          break;
        case 'email': console.log('Sending email report...');
          break;
        case 'backup': console.log('Creating backup...');
          break;
        default:
          console.log('Unknown export type');
      }
      
      setExportStatus('success');
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const handleNext = () => {
    navigate('/employee-detail-breakdown');
  };

  const handlePrevious = () => {
    navigate('/manual-adjustments');
  };

  const handleSave = async () => {
    setExportStatus('saved');
    setTimeout(() => setExportStatus('idle'), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StepProgressIndicator />
      <main className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Payroll Summary Results
            </h1>
            <p className="text-muted-foreground">
              Bi-weekly payroll calculations completed for pay period {payrollData?.dateRange}
            </p>
          </div>

          {/* Status Indicator */}
          <DataStatusIndicator 
            status={exportStatus}
            message={
              exportStatus === 'processing' ? 'Exporting payroll data...' :
              exportStatus === 'success' ? 'Payroll calculations completed successfully' :
              exportStatus === 'saved' ? 'Payroll data saved' :
              exportStatus === 'error' ? 'Export failed. Please try again.' : ''
            }
          />

          {/* Summary Card */}
          <PayrollSummaryCard 
            totalPayroll={payrollData?.totalPayroll}
            employeeCount={payrollData?.employeeCount}
            dateRange={payrollData?.dateRange}
          />

          {/* Metrics */}
          <PayrollMetrics metrics={payrollMetrics} />

          {/* Export Panel */}
          <ExportActionsPanel 
            onExport={handleExport}
            isExporting={isExporting}
          />

          {/* Employee Results Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Employee Payroll Results</h2>
              <div className="text-sm text-muted-foreground">
                Calculated on {payrollData?.calculationDate}
              </div>
            </div>
            
            <EmployeePayrollTable 
              employees={payrollData?.employees}
              onViewDetails={handleViewDetails}
            />
          </div>

          {/* Additional Information */}
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong>Calculation Method:</strong> Each employee's pay is calculated using MAX(Hourly, Commission) + Tips + Addings - (Discounts × 50%)
                </p>
                <p className="mb-2">
                  <strong>Pay Structures:</strong> Mixed employees receive the higher of hourly or commission pay, plus additional earnings and deductions.
                </p>
                <p>
                  <strong>Export Options:</strong> Use the export panel above to download detailed reports or email summaries to stakeholders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <WorkflowActionBar
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSave={handleSave}
        isNextDisabled={false}
        isPreviousDisabled={false}
        isSaving={exportStatus === 'saved'}
      />
    </div>
  );
};

export default PayrollSummaryResults;