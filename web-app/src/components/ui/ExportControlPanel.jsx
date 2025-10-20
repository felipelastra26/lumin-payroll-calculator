import React, { useState } from 'react';
import Button from './Button';
import Select from './Select';
import { Checkbox } from './Checkbox';
import Icon from '../AppIcon';

const ExportControlPanel = ({ 
  onExport, 
  availableFormats = ['pdf', 'excel', 'csv'],
  availableData = ['summary', 'detailed', 'individual'],
  isExporting = false,
  className = ''
}) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedData, setSelectedData] = useState('summary');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [emailAfterExport, setEmailAfterExport] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', description: 'Professional report format' },
    { value: 'excel', label: 'Excel Spreadsheet', description: 'Editable data format' },
    { value: 'csv', label: 'CSV File', description: 'Raw data export' }
  ]?.filter(option => availableFormats?.includes(option?.value));

  const dataOptions = [
    { value: 'summary', label: 'Payroll Summary', description: 'High-level overview' },
    { value: 'detailed', label: 'Detailed Breakdown', description: 'Complete calculations' },
    { value: 'individual', label: 'Individual Reports', description: 'Per-employee details' }
  ]?.filter(option => availableData?.includes(option?.value));

  const handleExport = () => {
    const exportConfig = {
      format: selectedFormat,
      dataType: selectedData,
      options: {
        includeCharts,
        includeNotes,
        emailAfterExport
      }
    };
    onExport(exportConfig);
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'pdf': return 'FileText';
      case 'excel': return 'Sheet';
      case 'csv': return 'Database';
      default: return 'File';
    }
  };

  const quickExportActions = [
    {
      label: 'Quick PDF',
      format: 'pdf',
      dataType: 'summary',
      icon: 'FileText',
      variant: 'outline'
    },
    {
      label: 'Excel Export',
      format: 'excel',
      dataType: 'detailed',
      icon: 'Sheet',
      variant: 'outline'
    },
    {
      label: 'Email Report',
      format: 'pdf',
      dataType: 'summary',
      icon: 'Mail',
      variant: 'secondary',
      email: true
    }
  ];

  const handleQuickExport = (action) => {
    const exportConfig = {
      format: action?.format,
      dataType: action?.dataType,
      options: {
        includeCharts: true,
        includeNotes: false,
        emailAfterExport: action?.email || false
      }
    };
    onExport(exportConfig);
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Download" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Export Options</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
          iconPosition="right"
          iconSize={16}
        >
          {isExpanded ? 'Simple' : 'Advanced'}
        </Button>
      </div>
      {/* Quick Actions */}
      {!isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickExportActions?.map((action, index) => (
              <Button
                key={index}
                variant={action?.variant}
                onClick={() => handleQuickExport(action)}
                disabled={isExporting}
                loading={isExporting}
                iconName={action?.icon}
                iconPosition="left"
                iconSize={16}
                className="justify-start"
              >
                {action?.label}
              </Button>
            ))}
          </div>
        </div>
      )}
      {/* Advanced Options */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Format and Data Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Export Format"
              options={formatOptions}
              value={selectedFormat}
              onChange={setSelectedFormat}
              placeholder="Choose format"
            />
            
            <Select
              label="Data to Export"
              options={dataOptions}
              value={selectedData}
              onChange={setSelectedData}
              placeholder="Choose data type"
            />
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Include Options</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Checkbox
                label="Include Charts"
                description="Add visual charts to the report"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e?.target?.checked)}
              />
              
              <Checkbox
                label="Include Notes"
                description="Add calculation notes and comments"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e?.target?.checked)}
              />
            </div>
            
            <Checkbox
              label="Email after export"
              description="Send the exported file via email"
              checked={emailAfterExport}
              onChange={(e) => setEmailAfterExport(e?.target?.checked)}
            />
          </div>

          {/* Export Button */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Format: {formatOptions?.find(f => f?.value === selectedFormat)?.label} • 
              Data: {dataOptions?.find(d => d?.value === selectedData)?.label}
            </div>
            
            <Button
              variant="default"
              onClick={handleExport}
              disabled={isExporting}
              loading={isExporting}
              iconName={getFormatIcon(selectedFormat)}
              iconPosition="left"
              iconSize={16}
            >
              {isExporting ? 'Exporting...' : 'Export Now'}
            </Button>
          </div>
        </div>
      )}
      {/* Export Status */}
      {isExporting && (
        <div className="px-4 pb-4">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Icon name="Loader2" size={16} className="text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">
                Preparing your export... This may take a few moments.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportControlPanel;