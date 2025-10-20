import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmployeeHeader = ({ employee, onBack, onPrint, onExport }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            iconName="ArrowLeft"
            iconSize={20}
            className="flex-shrink-0"
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{employee?.name}</h1>
            <p className="text-muted-foreground">Employee ID: {employee?.id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            iconName="Printer"
            iconPosition="left"
            iconSize={16}
          >
            Print
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onExport}
            iconName="Download"
            iconPosition="left"
            iconSize={16}
          >
            Export
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="DollarSign" size={16} className="text-success" />
            <span className="text-sm font-medium text-muted-foreground">Total Pay</span>
          </div>
          <div className="text-2xl font-bold text-success">${employee?.totalPay?.toFixed(2)}</div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Calendar" size={16} className="text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Pay Period</span>
          </div>
          <div className="text-lg font-semibold text-foreground">{employee?.payPeriod}</div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Clock" size={16} className="text-warning" />
            <span className="text-sm font-medium text-muted-foreground">Total Hours</span>
          </div>
          <div className="text-lg font-semibold text-foreground">{employee?.totalHours} hrs</div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHeader;