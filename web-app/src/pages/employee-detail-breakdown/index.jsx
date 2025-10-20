import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import StepProgressIndicator from '../../components/ui/StepProgressIndicator';
import WorkflowActionBar from '../../components/ui/WorkflowActionBar';
import ExportControlPanel from '../../components/ui/ExportControlPanel';
import EmployeeHeader from './components/EmployeeHeader';
import WeeklyBreakdown from './components/WeeklyBreakdown';
import ServicesTable from './components/ServicesTable';
import AddingsBreakdown from './components/AddingsBreakdown';
import ManualAdjustments from './components/ManualAdjustments';
import FinalTotalSummary from './components/FinalTotalSummary';

const EmployeeDetailBreakdown = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);

  // Get employee data from navigation state or use mock data
  const getEmployeeData = () => {
    if (location?.state?.employee) {
      return location?.state?.employee;
    }
    
    // Mock employee data for demonstration
    return {
      id: "EMP001",
      name: "Aubrie B",
      payPeriod: "Oct 7 - Oct 20, 2024",
      totalPay: 1247.50,
      totalHours: 78.5,
      commissionRate: 40,
      hourlyRate: 14.00,
      week1: {
        dateRange: "Oct 7 - Oct 13, 2024",
        hoursWorked: 38.5,
        hourlyRate: 14.00,
        hourlyPay: 539.00,
        commission: 486.40,
        commissionRate: 40,
        basePay: 539.00,
        tips: 125.50,
        addings: 18.00,
        discountDeduction: 15.75,
        totalPay: 666.75,
        services: [
          {
            date: "2024-10-07",
            client: "Sarah Johnson",
            service: "Full Set Acrylic",
            amount: 65.00
          },
          {
            date: "2024-10-07",
            client: "Maria Garcia",
            service: "Gel Manicure",
            amount: 35.00
          },
          {
            date: "2024-10-08",
            client: "Jennifer Smith",
            service: "Full Set Gel",
            amount: 70.00
          },
          {
            date: "2024-10-09",
            client: "Ashley Brown",
            service: "Refill Acrylic",
            amount: 45.00
          },
          {
            date: "2024-10-10",
            client: "Lisa Wilson",
            service: "Pedicure Deluxe",
            amount: 55.00
          },
          {
            date: "2024-10-11",
            client: "Rachel Davis",
            service: "Full Set Dip",
            amount: 60.00
          },
          {
            date: "2024-10-12",
            client: "Amanda Miller",
            service: "Gel Manicure",
            amount: 35.00
          },
          {
            date: "2024-10-13",
            client: "Nicole Taylor",
            service: "Full Set Acrylic",
            amount: 65.00
          }
        ],
        addings: {
          total: 18.00,
          fullSets: {
            count: 3,
            rate: 4.00,
            total: 12.00,
            details: [
              { date: "Oct 7", client: "Sarah Johnson", amount: 4.00 },
              { date: "Oct 8", client: "Jennifer Smith", amount: 4.00 },
              { date: "Oct 13", client: "Nicole Taylor", amount: 4.00 }
            ]
          },
          refills: {
            count: 3,
            rate: 2.00,
            total: 6.00,
            details: [
              { date: "Oct 9", client: "Ashley Brown", amount: 2.00 },
              { date: "Oct 11", client: "Rachel Davis", amount: 2.00 },
              { date: "Oct 12", client: "Amanda Miller", amount: 2.00 }
            ]
          }
        }
      },
      week2: {
        dateRange: "Oct 14 - Oct 20, 2024",
        hoursWorked: 40.0,
        hourlyRate: 14.00,
        hourlyPay: 560.00,
        commission: 512.80,
        commissionRate: 40,
        basePay: 560.00,
        tips: 98.75,
        addings: 22.00,
        discountDeduction: 12.50,
        totalPay: 668.25,
        services: [
          {
            date: "2024-10-14",
            client: "Stephanie Lee",
            service: "Full Set Gel",
            amount: 70.00
          },
          {
            date: "2024-10-15",
            client: "Michelle White",
            service: "Refill Gel",
            amount: 50.00
          },
          {
            date: "2024-10-16",
            client: "Kimberly Jones",
            service: "Full Set Acrylic",
            amount: 65.00
          },
          {
            date: "2024-10-17",
            client: "Danielle Clark",
            service: "Pedicure Basic",
            amount: 40.00
          },
          {
            date: "2024-10-18",
            client: "Brittany Lewis",
            service: "Full Set Dip",
            amount: 60.00
          },
          {
            date: "2024-10-19",
            client: "Samantha Hall",
            service: "Gel Manicure",
            amount: 35.00
          },
          {
            date: "2024-10-20",
            client: "Christina Young",
            service: "Full Set Acrylic",
            amount: 65.00
          }
        ],
        addings: {
          total: 22.00,
          fullSets: {
            count: 4,
            rate: 4.00,
            total: 16.00,
            details: [
              { date: "Oct 14", client: "Stephanie Lee", amount: 4.00 },
              { date: "Oct 16", client: "Kimberly Jones", amount: 4.00 },
              { date: "Oct 18", client: "Brittany Lewis", amount: 4.00 },
              { date: "Oct 20", client: "Christina Young", amount: 4.00 }
            ]
          },
          refills: {
            count: 3,
            rate: 2.00,
            total: 6.00,
            details: [
              { date: "Oct 15", client: "Michelle White", amount: 2.00 },
              { date: "Oct 17", client: "Danielle Clark", amount: 2.00 },
              { date: "Oct 19", client: "Samantha Hall", amount: 2.00 }
            ]
          }
        }
      },
      manualAdjustments: [
        {
          type: "bonus",
          amount: 50.00,
          date: "Oct 15, 2024",
          notes: "Exceptional customer service feedback bonus"
        },
        {
          type: "deduction",
          amount: -25.00,
          date: "Oct 18, 2024",
          notes: "Late arrival deduction (30 minutes)"
        }
      ]
    };
  };

  const [employeeData] = useState(getEmployeeData());

  const handleBack = () => {
    navigate('/payroll-summary-results');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async (exportConfig) => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Exporting employee details:', {
        employee: employeeData?.name,
        format: exportConfig?.format,
        dataType: exportConfig?.dataType,
        options: exportConfig?.options
      });
      
      // In a real application, this would trigger the actual export
      alert(`Export completed: ${employeeData?.name} payroll details exported as ${exportConfig?.format?.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleNext = () => {
    // Navigate to next logical step or back to summary
    navigate('/payroll-summary-results');
  };

  const handlePrevious = () => {
    navigate('/payroll-summary-results');
  };

  const handleSave = async () => {
    // Save current view state
    console.log('Saving employee detail view state...');
  };

  // Calculate summary data for final total component
  const summaryData = {
    week1Total: employeeData?.week1?.totalPay,
    week2Total: employeeData?.week2?.totalPay,
    biweeklySubtotal: employeeData?.week1?.totalPay + employeeData?.week2?.totalPay,
    totalAdjustments: employeeData?.manualAdjustments?.reduce((sum, adj) => sum + adj?.amount, 0),
    finalTotal: employeeData?.totalPay,
    totalHours: employeeData?.totalHours,
    commissionRate: employeeData?.commissionRate,
    hourlyRate: employeeData?.hourlyRate
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StepProgressIndicator />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {/* Employee Header */}
        <EmployeeHeader 
          employee={employeeData}
          onBack={handleBack}
          onPrint={handlePrint}
          onExport={() => setShowExportPanel(!showExportPanel)}
        />

        {/* Export Panel */}
        {showExportPanel && (
          <ExportControlPanel
            onExport={handleExport}
            availableFormats={['pdf', 'excel']}
            availableData={['detailed', 'individual']}
            isExporting={isExporting}
            className="mb-6"
          />
        )}

        {/* Week 1 Section */}
        <WeeklyBreakdown 
          weekData={employeeData?.week1}
          weekNumber={1}
        />
        
        <ServicesTable 
          services={employeeData?.week1?.services}
          weekNumber={1}
        />
        
        <AddingsBreakdown 
          addingsData={employeeData?.week1?.addings}
          weekNumber={1}
        />

        {/* Week 2 Section */}
        <WeeklyBreakdown 
          weekData={employeeData?.week2}
          weekNumber={2}
        />
        
        <ServicesTable 
          services={employeeData?.week2?.services}
          weekNumber={2}
        />
        
        <AddingsBreakdown 
          addingsData={employeeData?.week2?.addings}
          weekNumber={2}
        />

        {/* Manual Adjustments */}
        <ManualAdjustments 
          adjustments={employeeData?.manualAdjustments}
        />

        {/* Final Total Summary */}
        <FinalTotalSummary 
          summaryData={summaryData}
        />
      </main>
      <WorkflowActionBar
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSave={handleSave}
        customActions={[
          {
            label: 'Print Report',
            icon: 'Printer',
            onClick: handlePrint,
            variant: 'outline'
          }
        ]}
      />
    </div>
  );
};

export default EmployeeDetailBreakdown;