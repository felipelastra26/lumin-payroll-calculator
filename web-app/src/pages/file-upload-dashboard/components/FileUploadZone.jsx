import React, { useState, useRef } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FileUploadZone = ({ onFileUpload, isUploading, uploadedFiles }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e?.dataTransfer?.files);
    handleFileSelection(files);
  };

  const handleFileSelection = (files) => {
    const validFiles = files?.filter(file => {
      const isExcel = file?.name?.endsWith('.xlsx') || file?.name?.endsWith('.xls');
      const isValidSize = file?.size <= 10 * 1024 * 1024; // 10MB limit
      return isExcel && isValidSize;
    });

    if (validFiles?.length > 0) {
      onFileUpload(validFiles?.[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef?.current?.click();
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e?.target?.files);
    handleFileSelection(files);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-primary bg-blue-50 scale-105' :'border-border hover:border-primary hover:bg-muted/50'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isDragOver ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              <Icon 
                name={isUploading ? 'Loader2' : 'Upload'} 
                size={32} 
                className={isUploading ? 'animate-spin' : ''} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {isUploading ? 'Uploading Files...' : 'Upload Timecard Files'}
            </h3>
            <p className="text-muted-foreground">
              Drag and drop your Excel files here, or click to browse
            </p>
          </div>

          <div className="space-y-2">
            <Button
              variant="default"
              onClick={handleBrowseClick}
              disabled={isUploading}
              iconName="FolderOpen"
              iconPosition="left"
              iconSize={16}
            >
              Browse Files
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Supported formats: .xlsx, .xls</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>
      </div>

      {/* File Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-800">File Requirements</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Excel timecard files must contain employee hours and service data</li>
              <li>• Files should include ServiceProviderID for employee matching</li>
              <li>• Ensure all service prices and tip amounts are included</li>
              <li>• Files must cover the complete bi-weekly pay period</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadZone;