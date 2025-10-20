import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const RecentUploads = ({ uploads, onRemoveFile, onReprocessFile }) => {
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })?.format(date);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Icon name="CheckCircle" size={12} className="mr-1" />
            Processed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Icon name="Loader2" size={12} className="mr-1 animate-spin" />
            Processing
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Icon name="AlertCircle" size={12} className="mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Icon name="Clock" size={12} className="mr-1" />
            Pending
          </span>
        );
    }
  };

  if (!uploads || uploads?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center">
          <Icon name="FileX" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Recent Uploads</h3>
          <p className="text-muted-foreground">
            Upload your first timecard file to get started with payroll processing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="History" size={20} className="mr-2" />
          Recent Uploads
        </h3>
      </div>
      <div className="divide-y divide-border">
        {uploads?.map((upload) => (
          <div key={upload?.id} className="p-4 hover:bg-muted/50 transition-colors duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <Icon name="FileSpreadsheet" size={20} className="text-green-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {upload?.fileName}
                    </p>
                    {getStatusBadge(upload?.status)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{formatFileSize(upload?.fileSize)}</span>
                    <span>•</span>
                    <span>{formatDate(upload?.uploadedAt)}</span>
                    {upload?.recordCount && (
                      <>
                        <span>•</span>
                        <span>{upload?.recordCount} records</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {upload?.status === 'error' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReprocessFile(upload?.id)}
                    iconName="RotateCcw"
                    iconSize={14}
                  >
                    Retry
                  </Button>
                )}
                
                {upload?.status === 'success' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/employee-configuration'}
                    iconName="ArrowRight"
                    iconSize={14}
                  >
                    Continue
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFile(upload?.id)}
                  iconName="Trash2"
                  iconSize={14}
                  className="text-muted-foreground hover:text-error"
                />
              </div>
            </div>

            {upload?.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <Icon name="AlertTriangle" size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">Upload Error</p>
                    <p className="mt-1">{upload?.error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentUploads;