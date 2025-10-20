import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import StepProgressIndicator from '../../components/ui/StepProgressIndicator';
import WorkflowActionBar from '../../components/ui/WorkflowActionBar';
import DataStatusIndicator from '../../components/ui/DataStatusIndicator';
import EmployeeCard from './components/EmployeeCard';
import PayrollSettingsPanel from './components/PayrollSettingsPanel';
import BulkActionsPanel from './components/BulkActionsPanel';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const EmployeeConfiguration = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [payrollSettings, setPayrollSettings] = useState({});
  const [saveStatus, setSaveStatus] = useState('idle');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Mock employee data
  const mockEmployees = [
    {
      id: 1,
      name: "Aubrie B",
      payStructure: "commission_vs_hourly",
      commissionRate: 40,
      hourlyRate: 14.00,
      isConfigured: true,
      specialRules: ["Eligible for addings", "Tips included"]
    },
    {
      id: 2,
      name: "Megan T",
      payStructure: "commission_vs_hourly",
      commissionRate: 40,
      hourlyRate: 14.00,
      isConfigured: true,
      specialRules: ["Eligible for addings", "Tips included"]
    },
    {
      id: 3,
      name: "Hilda",
      payStructure: "pure_commission",
      commissionRate: 50,
      hourlyRate: 0,
      isConfigured: true,
      specialRules: ["Pure commission only", "Tips included", "Discount deductions apply"]
    },
    {
      id: 4,
      name: "Kennedi B",
      payStructure: "hourly_only",
      commissionRate: 0,
      hourlyRate: 14.00,
      isConfigured: true,
      specialRules: ["Hourly rate only", "No commission"]
    },
    {
      id: 5,
      name: "Valerie C",
      payStructure: "hourly_only",
      commissionRate: 0,
      hourlyRate: 14.00,
      isConfigured: true,
      specialRules: ["Hourly rate only", "No commission"]
    },
    {
      id: 6,
      name: "Erika Perez",
      payStructure: "hourly_only",
      commissionRate: 0,
      hourlyRate: 14.00,
      isConfigured: true,
      specialRules: ["Hourly rate only", "No commission"]
    },
    {
      id: 7,
      name: "Stylist Chelese",
      payStructure: "hourly_only",
      commissionRate: 0,
      hourlyRate: 14.00,
      isConfigured: true,
      specialRules: ["Hourly rate only", "No commission"]
    }
  ];

  const mockPayrollSettings = {
    fullSetAdding: 4.00,
    refillAdding: 2.00,
    discountDeduction: 50,
    tipCalculation: "Direct Addition"
  };

  useEffect(() => {
    // Simulate loading employee data
    const loadData = async () => {
      setSaveStatus('processing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmployees(mockEmployees);
      setPayrollSettings(mockPayrollSettings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    };

    loadData();
  }, []);

  const handleEmployeeUpdate = (employeeId, updateData) => {
    setEmployees(prev => prev?.map(emp => 
      emp?.id === employeeId 
        ? { ...emp, ...updateData, isConfigured: true }
        : emp
    ));
  };

  const handleEmployeeSave = async (employeeId) => {
    setSaveStatus('saved');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveStatus('idle');
  };

  const handleSettingsUpdate = (newSettings) => {
    setPayrollSettings(newSettings);
  };

  const handleSettingsSave = async () => {
    setSaveStatus('saved');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveStatus('idle');
  };

  const handleBulkUpdate = async (employeeIds, action, data) => {
    setSaveStatus('processing');
    
    // Simulate bulk update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setEmployees(prev => prev?.map(emp => {
      if (!employeeIds?.includes(emp?.id)) return emp;
      
      let updates = { isConfigured: true };
      
      switch (action) {
        case 'update_commission':
          updates.commissionRate = parseFloat(data?.commissionRate);
          break;
        case 'update_hourly':
          updates.hourlyRate = parseFloat(data?.hourlyRate);
          break;
        case 'change_structure':
          updates.payStructure = data?.payStructure;
          if (data?.commissionRate) updates.commissionRate = parseFloat(data?.commissionRate);
          if (data?.hourlyRate) updates.hourlyRate = parseFloat(data?.hourlyRate);
          break;
      }
      
      return { ...emp, ...updates };
    }));
    
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleApplyTemplate = async (employeeIds, template) => {
    setSaveStatus('processing');
    
    const templates = {
      stylist_standard: { payStructure: 'commission_vs_hourly', commissionRate: 40, hourlyRate: 14.00 },
      senior_stylist: { payStructure: 'pure_commission', commissionRate: 50, hourlyRate: 0 },
      hourly_staff: { payStructure: 'hourly_only', commissionRate: 0, hourlyRate: 14.00 }
    };
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setEmployees(prev => prev?.map(emp => 
      employeeIds?.includes(emp?.id) 
        ? { ...emp, ...templates?.[template], isConfigured: true }
        : emp
    ));
    
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleNext = () => {
    navigate('/manual-adjustments');
  };

  const handlePrevious = () => {
    navigate('/file-upload-dashboard');
  };

  const handleSave = async () => {
    setSaveStatus('saved');
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
                Configure pay structures and rules for all salon staff members
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
              saveStatus === 'processing' ? 'Loading employee configurations...' :
              saveStatus === 'saved' ? 'Employee configurations saved successfully' :
              saveStatus === 'success' ? 'All configurations loaded successfully' : ''
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
          
          <Button
            variant={showBulkActions ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowBulkActions(!showBulkActions)}
            iconName="Users"
            iconPosition="left"
            iconSize={16}
          >
            {showBulkActions ? 'Hide' : 'Show'} Bulk Actions
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Bulk Actions Panel */}
            {showBulkActions && (
              <BulkActionsPanel
                employees={employees}
                onBulkUpdate={handleBulkUpdate}
                onApplyTemplate={handleApplyTemplate}
              />
            )}

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
              (<div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Employee</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Pay Structure</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Commission</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Hourly Rate</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees?.map((employee, index) => (
                        <tr key={employee?.id} className={index % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Icon name="User" size={16} className="text-primary" />
                              </div>
                              <span className="font-medium text-foreground">{employee?.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-foreground">
                            {employee?.payStructure === 'commission_vs_hourly' && 'Commission vs Hourly'}
                            {employee?.payStructure === 'pure_commission' && 'Pure Commission'}
                            {employee?.payStructure === 'hourly_only' && 'Hourly Only'}
                          </td>
                          <td className="p-4 text-sm text-foreground">
                            {employee?.commissionRate > 0 ? `${employee?.commissionRate}%` : '—'}
                          </td>
                          <td className="p-4 text-sm text-foreground">
                            {employee?.hourlyRate > 0 ? `$${employee?.hourlyRate?.toFixed(2)}` : '—'}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Icon 
                                name={employee?.isConfigured ? 'CheckCircle' : 'AlertCircle'} 
                                size={16} 
                                className={employee?.isConfigured ? 'text-success' : 'text-warning'} 
                              />
                              <span className={`text-sm ${employee?.isConfigured ? 'text-success' : 'text-warning'}`}>
                                {employee?.isConfigured ? 'Configured' : 'Needs Setup'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="outline"
                              size="sm"
                              iconName="Edit"
                              iconSize={16}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>)
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payroll Settings */}
            <PayrollSettingsPanel
              settings={payrollSettings}
              onUpdate={handleSettingsUpdate}
              onSave={handleSettingsSave}
            />

            {/* Configuration Summary */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Configuration Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Employees</span>
                  <span className="text-sm font-medium text-foreground">{employees?.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Configured</span>
                  <span className="text-sm font-medium text-success">{configuredCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Commission vs Hourly</span>
                  <span className="text-sm font-medium text-foreground">
                    {employees?.filter(emp => emp?.payStructure === 'commission_vs_hourly')?.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pure Commission</span>
                  <span className="text-sm font-medium text-foreground">
                    {employees?.filter(emp => emp?.payStructure === 'pure_commission')?.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hourly Only</span>
                  <span className="text-sm font-medium text-foreground">
                    {employees?.filter(emp => emp?.payStructure === 'hourly_only')?.length}
                  </span>
                </div>
              </div>

              {!isAllConfigured && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Icon name="AlertTriangle" size={16} className="text-amber-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-amber-800">Action Required</div>
                      <div className="text-xs text-amber-700 mt-1">
                        {employees?.length - configuredCount} employee{employees?.length - configuredCount !== 1 ? 's' : ''} still need configuration
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <WorkflowActionBar
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSave={handleSave}
        isNextDisabled={!isAllConfigured}
        isSaving={saveStatus === 'saved'}
      />
    </div>
  );
};

export default EmployeeConfiguration;