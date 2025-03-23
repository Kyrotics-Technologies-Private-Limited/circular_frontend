// src/components/files/FileUpload.tsx
import React, { useState, useRef } from 'react';
import { uploadFile } from '../../services/file.service';
import { useOrganization } from '../../contexts/OrganizationContext';

interface FileUploadProps {
  organizationId?: string;
  folderId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  organizationId: propOrgId,
  folderId,
  onSuccess,
  onCancel
}) => {
  const { userType, currentOrganization } = useOrganization();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Determine organization ID based on context and props
  const organizationId = propOrgId || (userType === 'organization' ? currentOrganization?.id : undefined);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only PDF and Word documents are allowed');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
      setError('File size must be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      // Simulate upload progress (this would be handled by a real upload progress event in production)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);
      
      await uploadFile(file, organizationId, folderId || undefined);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Upload File
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {userType === 'organization' && currentOrganization 
            ? `Upload a PDF or Word document to ${currentOrganization.name}` 
            : 'Upload a PDF or Word document to your personal space'}
        </p>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      <div 
        className={`border-2 border-dashed rounded-md p-6 text-center ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        } hover:bg-gray-50 transition-colors duration-200 cursor-pointer`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          disabled={loading}
        />
        
        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div className="flex text-sm text-gray-600 justify-center">
            <label
              className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
            >
              <span>Upload a file</span>
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            PDF or Word up to 10MB
          </p>
        </div>
      </div>
      
      {file && (
        <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="ml-3 flex-1 truncate">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          
          {loading && (
            <div className="mt-2">
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200">
                  <div
                    style={{ width: `${uploadProgress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-300"
                  ></div>
                </div>
                <p className="text-xs text-right mt-1 text-gray-500">{uploadProgress}%</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;