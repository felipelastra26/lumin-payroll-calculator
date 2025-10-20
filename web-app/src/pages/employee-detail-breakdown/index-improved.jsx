import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import EmployeeHeader from './components/EmployeeHeader';
import WeeklyBreakdown from './components/WeeklyBreakdown';
import ServicesTable from './components/ServicesTable';
import AddingsBreakdown from './components/AddingsBreakdown';
import ManualAdjustments from './components/ManualAdjustments';
import FinalTotalSummary from './components/FinalTotalSummary';

const EmployeeDetailBreakdown = () => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = () => {
    try {
      const selectedEmployee = JSON.parse(sessionStorage.getItem('selectedEmployee') || '{}');
      
      if (!selectedEmployee.fullDetails) {
        throw new Error('No employee data found');
      }

      setEmployeeData(selectedEmployee);
    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/payroll-summary-results');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export for single employee
    console.log('Export PDF for employee:', employeeData.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading employee details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Employee data not found</p>
            <Button onClick={handleBack}>Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  const { fullDetails } = employeeData;
  const payPeriod = JSON.parse(sessionStorage.getItem('payPeriod') || '{}');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8 pb-16">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Back to Summary
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              iconName="Printer"
              iconPosition="left"
            >
              Print
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleExportPDF}
              iconName="Download"
              iconPosition="left"
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Employee Header */}
        <EmployeeHeader 
          employee={employeeData}
          payPeriod={payPeriod}
        />

        {/* Week 1 Breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
            <Icon name="Calendar" size={24} className="mr-2" />
            Week 1 ({new Date(payPeriod.startDate).toLocaleDateString()} - {new Date(new Date(payPeriod.startDate).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()})
          </h2>
          
          <WeeklyBreakdown 
            weekData={fullDetails.week1}
            employee={fullDetails.employee}
          />
          
          {fullDetails.week1.services && fullDetails.week1.services.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Services Provided</h3>
              <ServicesTable services={fullDetails.week1.services} />
            </div>
          )}
          
          {fullDetails.employee.hasAddings && fullDetails.week1.addings > 0 && (
            <div className="mt-6">
              <AddingsBreakdown 
                services={fullDetails.week1.services}
                totalAddings={fullDetails.week1.addings}
              />
            </div>
          )}
        </div>

        {/* Week 2 Breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
            <Icon name="Calendar" size={24} className="mr-2" />
            Week 2 ({new Date(new Date(payPeriod.startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date(payPeriod.endDate).toLocaleDateString()})
          </h2>
          
          <WeeklyBreakdown 
            weekData={fullDetails.week2}
            employee={fullDetails.employee}
          />
          
          {fullDetails.week2.services && fullDetails.week2.services.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Services Provided</h3>
              <ServicesTable services={fullDetails.week2.services} />
            </div>
          )}
          
          {fullDetails.employee.hasAddings && fullDetails.week2.addings > 0 && (
            <div className="mt-6">
              <AddingsBreakdown 
                services={fullDetails.week2.services}
                totalAddings={fullDetails.week2.addings}
              />
            </div>
          )}
        </div>

        {/* Manual Adjustments */}
        {fullDetails.adjustments && fullDetails.adjustments.length > 0 && (
          <div className="mb-8">
            <ManualAdjustments adjustments={fullDetails.adjustments} />
          </div>
        )}

        {/* Final Total */}
        <FinalTotalSummary 
          week1Total={fullDetails.week1.total}
          week2Total={fullDetails.week2.total}
          adjustments={fullDetails.totalAdjustments}
          finalPay={fullDetails.finalPay}
        />
      </main>
    </div>
  );
};

export default EmployeeDetailBreakdown;

