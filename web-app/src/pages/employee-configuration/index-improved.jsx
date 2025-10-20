import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import StepProgressIndicator from '../../components/ui/StepProgressIndicator';
import WorkflowActionBar from '../../components/ui/WorkflowActionBar';
import DataStatusIndicator from '../../components/ui/DataStatusIndicator';
import EmployeeCard from './components/EmployeeCard';
import PayrollSettingsPanel from './components/PayrollSettingsPanel';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { getEmployeePayStructure } from '../../services/azureService';

const EmployeeConfiguration = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [payrollSettings, setPayrollSettings] = useState({});
  const [saveStatus, setSaveStatus] = useState('idle');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  const defaultPayrollSettings = {
    fullSetAdding: 4.00,
    refillAdding: 2.00,
    discountDeduction: 50,
    tipCalculation: "Direct Addition"
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setSaveStatus('processing');
    
    try {
      // Get employees from session storage (loaded in previous step)
      const employeesData = JSON.parse(sessionStorage.getItem('employees') || '[]');
      
      // Map employees to include pay structure
      const employeesWithConfig = employeesData.map(emp => {
        const payStructure = getEmployeePayStructure(emp.fullName);
        
        return {
          id: emp.id,
          name: emp.fullName,
          ...payStructure,
          isConfigured: true,
          specialRules: getSpecialRules(payStructure)
        };
      });
      
      setEmployees(employeesWithConfig);
      setPayrollSettings(defaultPayrollSettings);
      
      // Save to session storage
      sessionStorage.setItem('employeesWithConfig', JSON.stringify(employeesWithConfig));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
      
    } catch (error) {
      console.error('Error loading employees:', error);
      setSaveStatus('error');
    }
  };

  const getSpecialRules = (payStructure) => {
    const rules = [];
    
    if (payStructure.payStructure === 'commission_vs_hourly') {
      rules.push('Commission vs Hourly (higher wins)');
    } else if (payStructure.payStructure === 'pure_commission') {
      rules.push('Pure commission only');
    } else {
      rules.push('Hourly rate only');
    }
    
    if (payStructure.hasAddings) {
      rules.push('Eligible for addings ($4 full sets, $2 refills)');
    }
    
    if (payStructure.hasTips) {
      rules.push('Tips included');
    }
    
    if (payStructure.hasDiscountDeductions) {
      rules.push('Discount deductions apply (50%)');
    }
    
    return rules;
  };

  const handleEmployeeUpdate = (employeeId, updateData) => {
    setEmployees(prev => prev?.map(emp => 
      emp?.id === employeeId 
        ? { ...emp, ...updateData, isConfigured: true }
        : emp
    ));
  };

  const handleEmployeeSave = async (employeeId) => {
    setSaveStatus('saved');
    // Update session storage
    sessionStorage.setItem('employeesWithConfig', JSON.stringify(employees));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveStatus('idle');
  };

  const handleSettingsUpdate = (newSettings) => {
    setPayrollSettings(newSettings);
    sessionStorage.setItem('payrollSettings', JSON.stringify(newSettings));
  };

  const handleSettingsSave = async () => {
    setSaveStatus('saved');
    sessionStorage.setItem('payrollSettings', JSON.stringify(payrollSettings));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveStatus('idle');
  };

  const handleNext = () => {
    navigate('/manual-adjustments');
  };

  const handlePrevious = () => {
    navigate('/file-upload-dashboard');
  };

  const handleSave = async () => {
    setSaveStatus('saved');
    sessionStorage.setItem('employeesWithConfig', JSON.stringify(employees));
    sessionStorage.setItem('payrollSettings', JSON.stringify(payrollSettings));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveStatus('idle');
  };

  const configuredCount = employees?.filter(emp => emp?.isConfigured)?.length;
  const isAllConfigured = configuredCount === employees?.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StepProgressIndicator />
      <main className="container mx-auto px-6 py-8 pb-32">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Employee Configuration</h1>
              <p className="text-muted-foreground">
                Review pay structures loaded from Azure for all salon staff members
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {configuredCount} of {employees?.length} Configured
                </div>
                <div className="text-xs text-muted-foreground">
                  {isAllConfigured ? 'All employees ready' : `${employees?.length - configuredCount} remaining`}
                </div>
              </div>
              
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isAllConfigured ? 'bg-success/10' : 'bg-warning/10'
              }`}>
                <Icon 
                  name={isAllConfigured ? 'CheckCircle' : 'Clock'} 
                  size={24} 
                  className={isAllConfigured ? 'text-success' : 'text-warning'} 
                />
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <DataStatusIndicator 
            status={saveStatus}
            message={
              saveStatus === 'processing' ? 'Loading employee configurations from Azure...' :
              saveStatus === 'saved' ? 'Employee configurations saved successfully' :
              saveStatus === 'success' ? `Loaded ${employees.length} employees successfully` : ''
            }
          />
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
              iconName="Grid3X3"
              iconPosition="left"
              iconSize={16}
            >
              Card View
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              iconName="List"
              iconPosition="left"
              iconSize={16}
            >
              Table View
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Employee Cards */}
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {employees?.map((employee) => (
                  <EmployeeCard
                    key={employee?.id}
                    employee={employee}
                    onUpdate={handleEmployeeUpdate}
                    onSave={handleEmployeeSave}
                  />
                ))}
              </div>
            ) : (
              /* Table View */
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Employee</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Pay Structure</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Commission</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Hourly</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees?.map((employee) => (
                        <tr key={employee?.id} className="border-t border-border">
                          <td className="px-4 py-3 text-sm text-foreground">{employee?.name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {employee?.payStructure === 'commission_vs_hourly' ? 'Commission vs Hourly' :
                             employee?.payStructure === 'pure_commission' ? 'Pure Commission' :
                             'Hourly Only'}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">{employee?.commissionRate}%</td>
                          <td className="px-4 py-3 text-sm text-foreground">${employee?.hourlyRate?.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            {employee?.isConfigured ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                                <Icon name="CheckCircle" size={12} className="mr-1" />
                                Configured
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                                <Icon name="Clock" size={12} className="mr-1" />
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <PayrollSettingsPanel
              settings={payrollSettings}
              onUpdate={handleSettingsUpdate}
              onSave={handleSettingsSave}
            />
          </div>
        </div>
      </main>
      <WorkflowActionBar
        onNext={handleNext}
        onSave={handleSave}
        onPrevious={handlePrevious}
        isNextDisabled={!isAllConfigured}
        isPreviousDisabled={false}
        isSaving={saveStatus === 'saved'}
      />
    </div>
  );
};

export default EmployeeConfiguration;

