import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const UploadInstructions = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const instructions = [
    {
      step: 1,
      title: "Prepare Your Timecard File",
      description: "Export timecard data from your salon management system as an Excel file (.xlsx format)",
      details: [
        "Include all employee hours for the bi-weekly pay period",
        "Ensure ServiceProviderID column matches employee records",
        "Include service prices, tips, and discount information",
        "Verify all dates fall within the correct pay period"
      ]
    },
    {
      step: 2,
      title: "Upload the File",
      description: "Drag and drop your Excel file or click browse to select it from your computer",
      details: [
        "File size must be under 10MB",
        "Only .xlsx and .xls formats are accepted",
        "File will be validated automatically upon upload",
        "You\'ll see a progress indicator during upload"
      ]
    },
    {
      step: 3,
      title: "Review and Continue",
      description: "Once uploaded successfully, review the file details and proceed to payroll configuration",
      details: [
        "Check that the correct number of records were imported",
        "Verify the date range matches your pay period",
        "Note any validation warnings or errors",
        "Click \'Continue to Configuration\' when ready"
      ]
    }
  ];

  const sampleData = [
    { field: "ServiceProviderID", example: "EMP001", description: "Unique employee identifier" },
    { field: "Date", example: "10/15/2024", description: "Service date (MM/DD/YYYY)" },
    { field: "ClientName", example: "Sarah Johnson", description: "Customer name" },
    { field: "ServiceType", example: "Full Set", description: "Type of service provided" },
    { field: "ServicePrice", example: "65.00", description: "Total service amount" },
    { field: "Tips", example: "13.00", description: "Tip amount received" },
    { field: "Discount", example: "5.00", description: "Discount applied" },
    { field: "Hours", example: "8.5", description: "Hours worked that day" }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Start Instructions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="BookOpen" size={20} className="mr-2 text-primary" />
            Upload Instructions
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
            iconSize={16}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {instructions?.map((instruction) => (
            <div key={instruction?.step} className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {instruction?.step}
                </div>
                <h4 className="text-sm font-medium text-foreground">{instruction?.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground pl-8">
                {instruction?.description}
              </p>
            </div>
          ))}
        </div>

        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-border space-y-6">
            {/* Detailed Steps */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-foreground">Detailed Instructions</h4>
              {instructions?.map((instruction) => (
                <div key={instruction?.step} className="bg-muted rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {instruction?.step}
                    </div>
                    <h5 className="text-sm font-medium text-foreground">{instruction?.title}</h5>
                  </div>
                  <ul className="space-y-1 pl-10">
                    {instruction?.details?.map((detail, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start">
                        <Icon name="Check" size={12} className="mr-2 mt-0.5 text-success flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Sample Data Format */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-foreground">Expected Data Format</h4>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-3">
                  Your Excel file should contain the following columns:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium text-foreground">Field Name</th>
                        <th className="text-left py-2 px-3 font-medium text-foreground">Example</th>
                        <th className="text-left py-2 px-3 font-medium text-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData?.map((item, index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono text-primary">{item?.field}</td>
                          <td className="py-2 px-3 font-mono text-muted-foreground">{item?.example}</td>
                          <td className="py-2 px-3 text-muted-foreground">{item?.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Quick Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-amber-800">Pro Tips</h4>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Save your file as .xlsx format for best compatibility</li>
              <li>• Remove any empty rows or columns before uploading</li>
              <li>• Ensure dates are in MM/DD/YYYY format</li>
              <li>• Double-check ServiceProviderID matches your employee records</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadInstructions;