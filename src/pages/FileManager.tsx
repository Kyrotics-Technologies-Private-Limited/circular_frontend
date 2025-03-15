// src/pages/FileManager.tsx
import React from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import FileExplorer from '../components/files/FileExplorer';
import OrganizationForm from '../components/organizations/OrganizationForm';

const FileManager: React.FC = () => {
  const { organizations, currentOrganization, loading } = useOrganization();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="spinner">Loading...</div>
      </div>
    );
  }
  
  if (organizations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            File Manager
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create an organization to get started with file management
          </p>
        </div>
        
        <OrganizationForm />
      </div>
    );
  }
  
  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No organization selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please select an organization from the dropdown in the header.
        </p>
      </div>
    );
  }
  
  return <FileExplorer />;
};

export default FileManager;