import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import StepProgressIndicator from '../../components/ui/StepProgressIndicator';
import WorkflowActionBar from '../../components/ui/WorkflowActionBar';
import DataStatusIndicator from '../../components/ui/DataStatusIndicator';
import FileUploadZone from './components/FileUploadZone';
import UploadProgress from './components/UploadProgress';
import RecentUploads from './components/RecentUploads';
import UploadInstructions from './components/UploadInstructions';
import Icon from '../../components/AppIcon';

const FileUploadDashboard = () => {
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [recentUploads, setRecentUploads] = useState([]);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);

  // Mock recent uploads data
  useEffect(() => {
    const mockUploads = [
      {
        id: 1,
        fileName: "Timecard_Oct_2024_Week1-2.xlsx",
        fileSize: 245760,
        uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'success',
        recordCount: 156
      },
      {
        id: 2,
        fileName: "Payroll_Data_Sept_2024.xlsx",
        fileSize: 189440,
        uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'success',
        recordCount: 142
      },
      {
        id: 3,
        fileName: "Employee_Hours_Sept_Week4.xlsx",
        fileSize: 98304,
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'error',
        error: "Missing ServiceProviderID column. Please ensure your file includes employee identification data."
      }
    ];
    setRecentUploads(mockUploads);
  }, []);

  const handleFileUpload = async (file) => {
    setCurrentFile(file);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setStatusMessage('Uploading file...');
    setIsProcessingComplete(false);

    try {
      // Simulate file upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(progress);
        
        if (progress === 50) {
          setStatusMessage('Validating file format...');
        } else if (progress === 80) {
          setStatusMessage('Processing data...');
          setUploadStatus('processing');
        }
      }

      // Simulate processing completion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadStatus('success');
      setStatusMessage('File uploaded and processed successfully!');
      setIsProcessingComplete(true);

      // Add to recent uploads
      const newUpload = {
        id: Date.now(),
        fileName: file?.name,
        fileSize: file?.size,
        uploadedAt: new Date(),
        status: 'success',
        recordCount: Math.floor(Math.random() * 200) + 50 // Mock record count
      };

      setRecentUploads(prev => [newUpload, ...prev]);

    } catch (error) {
      setUploadStatus('error');
      setStatusMessage('Upload failed. Please try again.');
      console.error('Upload error:', error);
    }
  };

  const handleRemoveFile = (fileId) => {
    setRecentUploads(prev => prev?.filter(upload => upload?.id !== fileId));
  };

  const handleReprocessFile = async (fileId) => {
    const file = recentUploads?.find(upload => upload?.id === fileId);
    if (file) {
      // Reset the file status and retry
      setRecentUploads(prev => 
        prev?.map(upload => 
          upload?.id === fileId 
            ? { ...upload, status: 'processing', error: null }
            : upload
        )
      );

      // Simulate reprocessing
      setTimeout(() => {
        setRecentUploads(prev => 
          prev?.map(upload => 
            upload?.id === fileId 
              ? { ...upload, status: 'success', recordCount: Math.floor(Math.random() * 200) + 50 }
              : upload
          )
        );
      }, 3000);
    }
  };

  const handleNext = () => {
    if (isProcessingComplete) {
      window.location.href = '/employee-configuration';
    }
  };

  const handleSave = () => {
    setUploadStatus('saved');
    setStatusMessage('Progress saved successfully');
    setTimeout(() => {
      setUploadStatus('idle');
      setStatusMessage('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StepProgressIndicator />
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">File Upload Dashboard</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload your Excel timecard files to begin payroll processing. 
              Ensure your files contain employee hours, service data, and tip information for accurate calculations.
            </p>
          </div>

          {/* Status Indicator */}
          <DataStatusIndicator 
            status={uploadStatus}
            message={statusMessage}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Upload Area */}
            <div className="lg:col-span-2 space-y-6">
              <FileUploadZone 
                onFileUpload={handleFileUpload}
                isUploading={uploadStatus === 'uploading' || uploadStatus === 'processing'}
                uploadedFiles={recentUploads}
              />

              {/* Upload Progress */}
              {currentFile && (uploadStatus === 'uploading' || uploadStatus === 'processing' || uploadStatus === 'success') && (
                <UploadProgress
                  progress={uploadProgress}
                  fileName={currentFile?.name}
                  status={uploadStatus}
                  fileSize={currentFile?.size}
                />
              )}

              {/* Success Message */}
              {uploadStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Icon name="CheckCircle" size={24} className="text-success" />
                    <div>
                      <h3 className="text-sm font-medium text-green-800">Upload Complete!</h3>
                      <p className="text-xs text-green-700 mt-1">
                        Your timecard file has been processed successfully. You can now proceed to configure employee pay rules.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Uploads */}
              <RecentUploads 
                uploads={recentUploads}
                onRemoveFile={handleRemoveFile}
                onReprocessFile={handleReprocessFile}
              />
            </div>

            {/* Instructions Sidebar */}
            <div className="lg:col-span-1">
              <UploadInstructions />
            </div>
          </div>
        </div>
      </main>
      <WorkflowActionBar
        onNext={handleNext}
        onSave={handleSave}
        onPrevious={() => {}}
        isNextDisabled={!isProcessingComplete}
        isPreviousDisabled={true}
        isSaving={uploadStatus === 'saved'}
      />
    </div>
  );
};

export default FileUploadDashboard;