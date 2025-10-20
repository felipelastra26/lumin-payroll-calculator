import React from 'react';
import Icon from '../../../components/AppIcon';

const UploadProgress = ({ progress, fileName, status, fileSize }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          icon: 'Upload',
          color: 'bg-primary',
          textColor: 'text-primary',
          bgColor: 'bg-blue-50 border-blue-200'
        };
      case 'processing':
        return {
          icon: 'Loader2',
          color: 'bg-primary',
          textColor: 'text-primary',
          bgColor: 'bg-blue-50 border-blue-200'
        };
      case 'success':
        return {
          icon: 'CheckCircle',
          color: 'bg-success',
          textColor: 'text-success',
          bgColor: 'bg-green-50 border-green-200'
        };
      case 'error':
        return {
          icon: 'AlertCircle',
          color: 'bg-error',
          textColor: 'text-error',
          bgColor: 'bg-red-50 border-red-200'
        };
      default:
        return {
          icon: 'File',
          color: 'bg-muted',
          textColor: 'text-muted-foreground',
          bgColor: 'bg-muted border-border'
        };
    }
  };

  const config = getStatusConfig();
  const isAnimated = status === 'uploading' || status === 'processing';

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  return (
    <div className={`border rounded-lg p-4 ${config?.bgColor}`}>
      <div className="flex items-center space-x-3 mb-3">
        <Icon 
          name={config?.icon} 
          size={20} 
          className={`${config?.textColor} ${
            isAnimated && status === 'processing' ? 'animate-spin' : ''
          } ${isAnimated && status === 'uploading' ? 'animate-pulse' : ''}`} 
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">
            {fileName || 'Processing file...'}
          </div>
          {fileSize && (
            <div className="text-xs text-muted-foreground">
              {formatFileSize(fileSize)}
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
      {status === 'success' && (
        <div className="mt-3 text-xs text-success">
          File uploaded successfully! Ready for processing.
        </div>
      )}
      {status === 'error' && (
        <div className="mt-3 text-xs text-error">
          Upload failed. Please check file format and try again.
        </div>
      )}
    </div>
  );
};

export default UploadProgress;