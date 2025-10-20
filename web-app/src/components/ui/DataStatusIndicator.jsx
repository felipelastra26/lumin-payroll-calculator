import React from 'react';
import Icon from '../AppIcon';

const DataStatusIndicator = ({ 
  status = 'idle', 
  message = '', 
  details = null,
  showDetails = false,
  onDetailsToggle = null 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          icon: 'Upload',
          iconClass: 'text-primary animate-pulse',
          bgClass: 'bg-blue-50 border-blue-200',
          textClass: 'text-blue-800',
          defaultMessage: 'Uploading files...'
        };
      case 'processing':
        return {
          icon: 'Loader2',
          iconClass: 'text-primary animate-spin',
          bgClass: 'bg-blue-50 border-blue-200',
          textClass: 'text-blue-800',
          defaultMessage: 'Processing data...'
        };
      case 'success':
        return {
          icon: 'CheckCircle',
          iconClass: 'text-success',
          bgClass: 'bg-green-50 border-green-200',
          textClass: 'text-green-800',
          defaultMessage: 'Data saved successfully'
        };
      case 'error':
        return {
          icon: 'AlertCircle',
          iconClass: 'text-error',
          bgClass: 'bg-red-50 border-red-200',
          textClass: 'text-red-800',
          defaultMessage: 'An error occurred'
        };
      case 'warning':
        return {
          icon: 'AlertTriangle',
          iconClass: 'text-warning',
          bgClass: 'bg-amber-50 border-amber-200',
          textClass: 'text-amber-800',
          defaultMessage: 'Please review the data'
        };
      case 'saved':
        return {
          icon: 'Save',
          iconClass: 'text-success',
          bgClass: 'bg-green-50 border-green-200',
          textClass: 'text-green-800',
          defaultMessage: 'Changes saved'
        };
      case 'calculating':
        return {
          icon: 'Calculator',
          iconClass: 'text-primary animate-pulse',
          bgClass: 'bg-blue-50 border-blue-200',
          textClass: 'text-blue-800',
          defaultMessage: 'Calculating payroll...'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  
  if (!config || status === 'idle') {
    return null;
  }

  const displayMessage = message || config?.defaultMessage;

  return (
    <div className={`rounded-lg border p-3 ${config?.bgClass} transition-all duration-150`}>
      <div className="flex items-start space-x-3">
        <Icon 
          name={config?.icon} 
          size={20} 
          className={`mt-0.5 flex-shrink-0 ${config?.iconClass}`} 
        />
        
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${config?.textClass}`}>
            {displayMessage}
          </div>
          
          {details && (
            <div className="mt-1">
              {showDetails ? (
                <div className={`text-xs ${config?.textClass} opacity-80`}>
                  {typeof details === 'string' ? details : (
                    <div className="space-y-1">
                      {Object.entries(details)?.map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key?.replace(/([A-Z])/g, ' $1')?.toLowerCase()}:</span>
                          <span className="font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onDetailsToggle}
                  className={`text-xs ${config?.textClass} opacity-80 hover:opacity-100 underline transition-opacity duration-150`}
                >
                  Show details
                </button>
              )}
            </div>
          )}
        </div>

        {details && showDetails && onDetailsToggle && (
          <button
            onClick={onDetailsToggle}
            className={`flex-shrink-0 ${config?.iconClass} hover:opacity-80 transition-opacity duration-150`}
          >
            <Icon name="ChevronUp" size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// Progress variant for file uploads and processing
export const DataProgressIndicator = ({ 
  progress = 0, 
  status = 'processing', 
  fileName = '', 
  fileSize = null 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          icon: 'Upload',
          color: 'bg-primary',
          textColor: 'text-primary'
        };
      case 'processing':
        return {
          icon: 'Loader2',
          color: 'bg-primary',
          textColor: 'text-primary'
        };
      case 'complete':
        return {
          icon: 'CheckCircle',
          color: 'bg-success',
          textColor: 'text-success'
        };
      case 'error':
        return {
          icon: 'AlertCircle',
          color: 'bg-error',
          textColor: 'text-error'
        };
      default:
        return {
          icon: 'File',
          color: 'bg-muted',
          textColor: 'text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig();
  const isAnimated = status === 'uploading' || status === 'processing';

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center space-x-3 mb-3">
        <Icon 
          name={config?.icon} 
          size={20} 
          className={`${config?.textColor} ${isAnimated && status === 'processing' ? 'animate-spin' : ''} ${isAnimated && status === 'uploading' ? 'animate-pulse' : ''}`} 
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">
            {fileName || 'Processing file...'}
          </div>
          {fileSize && (
            <div className="text-xs text-muted-foreground">
              {fileSize}
            </div>
          )}
        </div>
        <div className="text-sm font-mono text-muted-foreground">
          {progress}%
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${config?.color}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

export default DataStatusIndicator;