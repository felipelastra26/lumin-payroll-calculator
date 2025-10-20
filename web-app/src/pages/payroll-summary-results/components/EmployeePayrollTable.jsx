import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const EmployeePayrollTable = ({ employees, onViewDetails }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const getPayStructureIcon = (payStructure) => {
    switch (payStructure) {
      case 'Commission':
        return 'TrendingUp';
      case 'Hourly':
        return 'Clock';
      case 'Mixed':
        return 'BarChart3';
      default:
        return 'DollarSign';
    }
  };

  const getPayStructureColor = (payStructure) => {
    switch (payStructure) {
      case 'Commission':
        return 'text-success';
      case 'Hourly':
        return 'text-primary';
      case 'Mixed':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-foreground">Employee</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Pay Structure</th>
                <th className="text-right py-3 px-4 font-medium text-foreground">Total Pay</th>
                <th className="text-center py-3 px-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees?.map((employee) => (
                <tr key={employee?.id} className="border-b border-border hover:bg-muted/30 transition-colors duration-150">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="User" size={20} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{employee?.name}</div>
                        <div className="text-sm text-muted-foreground">{employee?.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={getPayStructureIcon(employee?.payStructure)} 
                        size={16} 
                        className={getPayStructureColor(employee?.payStructure)} 
                      />
                      <span className="text-sm text-foreground">{employee?.payStructure}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-semibold text-lg text-foreground">
                      {formatCurrency(employee?.totalPay)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Bi-weekly total
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(employee?.id)}
                      iconName="Eye"
                      iconPosition="left"
                      iconSize={16}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden">
        <div className="divide-y divide-border">
          {employees?.map((employee) => (
            <div key={employee?.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="User" size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{employee?.name}</div>
                    <div className="text-sm text-muted-foreground">{employee?.position}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg text-foreground">
                    {formatCurrency(employee?.totalPay)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={getPayStructureIcon(employee?.payStructure)} 
                    size={16} 
                    className={getPayStructureColor(employee?.payStructure)} 
                  />
                  <span className="text-sm text-muted-foreground">{employee?.payStructure}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(employee?.id)}
                  iconName="Eye"
                  iconPosition="left"
                  iconSize={16}
                >
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeePayrollTable;