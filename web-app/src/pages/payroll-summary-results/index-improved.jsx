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
import { getTransactions } from '../../services/azureService';
import { calculatePayroll } from '../../services/payrollService';

const PayrollSummaryResults = () => {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('idle');
  const [calculating, setCalculating] = useState(true);
  const [payrollResults, setPayrollResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    calculatePayrollData();
  }, []);

  const calculatePayrollData = async () => {
    setCalculating(true);
    setError(null);

    try {
      // Get data from session storage
      const employeesData = JSON.parse(sessionStorage.getItem('employeesWithConfig') || '[]');
      const payPeriod = JSON.parse(sessionStorage.getItem('payPeriod') || '{}');
      const timecardData = JSON.parse(sessionStorage.getItem('timecardData') || '{}');
      const adjustments = JSON.parse(sessionStorage.getItem('adjustments') || '[]');

      if (!employeesData.length) {
        throw new Error('No employees found. Please go back and load employees.');
      }

      if (!payPeriod.startDate || !payPeriod.endDate) {
        throw new Error('Pay period not configured. Please go back and select dates.');
      }

      // Fetch transactions from Azure
      const transactions = await getTransactions(payPeriod.startDate, payPeriod.endDate);

      // Calculate payroll for all employees
      const results = calculatePayroll(employeesData, transactions, timecardData, payPeriod, adjustments);

      // Calculate totals
      const totalPayroll = results.reduce((sum, r) => sum + r.finalPay, 0);
      const totalHours = results.reduce((sum, r) => sum + r.totalHours, 0);

      // Format results for display
      const formattedResults = {
        totalPayroll: Math.round(totalPayroll * 100) / 100,
        employeeCount: results.length,
        totalHours: Math.round(totalHours * 100) / 100,
        dateRange: `${new Date(payPeriod.startDate).toLocaleDateString()} - ${new Date(payPeriod.endDate).toLocaleDateString()}`,
        payDate: new Date(payPeriod.payDate).toLocaleDateString(),
        calculationDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        employees: results.map(r => ({
          id: r.employee.id,
          name: r.employee.name || r.employee.fullName,
          position: getPosition(r.employee),
          payStructure: getPayStructureLabel(r.employee.payStructure),
          totalPay: Math.round(r.finalPay * 100) / 100,
          week1Pay: Math.round(r.week1.total * 100) / 100,
          week2Pay: Math.round(r.week2.total * 100) / 100,
          commissionRate: r.employee.commissionRate / 100,
          hourlyRate: r.employee.hourlyRate,
          totalHours: r.totalHours,
          adjustments: r.adjustments,
          totalAdjustments: r.totalAdjustments,
          // Store full details for detail view
          fullDetails: r
        }))
      };

      setPayrollResults(formattedResults);

      // Store results for detail view and export
      sessionStorage.setItem('payrollResults', JSON.stringify(formattedResults));

    } catch (err) {
      console.error('Error calculating payroll:', err);
      setError(err.message);
    } finally {
      setCalculating(false);
    }
  };

  const getPosition = (employee) => {
    const name = (employee.name || employee.fullName || '').toLowerCase();
    if (name.includes('aubrie') || name.includes('megan')) return 'Senior Stylist';
    if (name.includes('hilda')) return 'PMU Artist';
    return 'Stylist';
  };

  const getPayStructureLabel = (payStructure) => {
    switch (payStructure) {
      case 'commission_vs_hourly': return 'Commission vs Hourly';
      case 'pure_commission': return 'Pure Commission';
      case 'hourly_only': return 'Hourly Only';
      default: return 'Unknown';
    }
  };

  const handleEmployeeClick = (employee) => {
    // Store selected employee for detail view
    sessionStorage.setItem('selectedEmployee', JSON.stringify(employee));
    navigate('/employee-detail-breakdown');
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportStatus('processing');

    try {
      // TODO: Implement PDF export
      await new Promise(resolve => setTimeout(resolve, 2000));
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      setExportStatus('error');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    setExportStatus('processing');

    try {
      // TODO: Implement Excel export
      await new Promise(resolve => setTimeout(resolve, 2000));
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      setExportStatus('error');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleEmailReport = async () => {
    setIsExporting(true);
    setExportStatus('processing');

    try {
      // TODO: Implement email functionality
      await new Promise(resolve => setTimeout(resolve, 2000));
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      setExportStatus('error');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleNext = () => {
    // Final step - maybe show a completion page or go back to start
    navigate('/');
  };

  const handlePrevious = () => {
    navigate('/manual-adjustments');
  };

  const handleSave = async () => {
    // Save results
    sessionStorage.setItem('payrollResults', JSON.stringify(payrollResults));
  };

  if (calculating) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <StepProgressIndicator />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-foreground">Calculating Payroll...</h2>
            <p className="text-muted-foreground mt-2">
              Fetching transactions from Azure and calculating employee pay
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <StepProgressIndicator />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Calculation Error</h2>
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => navigate('/file-upload-dashboard')}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!payrollResults) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StepProgressIndicator />
      <main className="container mx-auto px-6 py-8 pb-32">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Payroll Summary</h1>
          <p className="text-muted-foreground">
            Review calculated payroll for {payrollResults.dateRange}
          </p>
          
          <DataStatusIndicator 
            status={exportStatus}
            message={
              exportStatus === 'processing' ? 'Exporting payroll report...' :
              exportStatus === 'success' ? 'Report exported successfully!' :
              exportStatus === 'error' ? 'Export failed. Please try again.' : ''
            }
          />
        </div>

        {/* Metrics */}
        <PayrollMetrics data={payrollResults} />

        {/* Summary Card */}
        <div className="mb-8">
          <PayrollSummaryCard data={payrollResults} />
        </div>

        {/* Employee Table */}
        <div className="mb-8">
          <EmployeePayrollTable 
            employees={payrollResults.employees}
            onEmployeeClick={handleEmployeeClick}
          />
        </div>

        {/* Export Actions */}
        <ExportActionsPanel
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          onEmailReport={handleEmailReport}
          isExporting={isExporting}
        />
      </main>
      <WorkflowActionBar
        onNext={handleNext}
        onSave={handleSave}
        onPrevious={handlePrevious}
        isNextDisabled={false}
        isPreviousDisabled={false}
        isSaving={false}
      />
    </div>
  );
};

export default PayrollSummaryResults;

