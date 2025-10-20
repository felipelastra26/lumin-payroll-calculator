import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ExportActionsPanel = ({ onExport, isExporting = false }) => {
  const [exportingType, setExportingType] = useState(null);

  const handleExport = async (type) => {
    setExportingType(type);
    try {
      await onExport(type);
    } finally {
      setExportingType(null);
    }
  };

  const exportOptions = [
    {
      type: 'pdf',
      label: 'Download PDF',
      description: 'Professional payroll report',
      icon: 'FileText',
      variant: 'default'
    },
    {
      type: 'excel',
      label: 'Download Excel',
      description: 'Editable spreadsheet format',
      icon: 'Sheet',
      variant: 'outline'
    },
    {
      type: 'email',
      label: 'Email Report',
      description: 'Send via email',
      icon: 'Mail',
      variant: 'secondary'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Icon name="Download" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Export Options</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {exportOptions?.map((option) => (
          <div key={option?.type} className="text-center">
            <Button
              variant={option?.variant}
              onClick={() => handleExport(option?.type)}
              disabled={isExporting}
              loading={exportingType === option?.type}
              iconName={option?.icon}
              iconPosition="left"
              iconSize={16}
              fullWidth
              className="mb-2"
            >
              {option?.label}
            </Button>
            <p className="text-xs text-muted-foreground">{option?.description}</p>
          </div>
        ))}
      </div>
      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            iconName="Printer"
            iconPosition="left"
            iconSize={16}
          >
            Print Summary
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExport('backup')}
            disabled={isExporting}
            loading={exportingType === 'backup'}
            iconName="Archive"
            iconPosition="left"
            iconSize={16}
          >
            Create Backup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportActionsPanel;