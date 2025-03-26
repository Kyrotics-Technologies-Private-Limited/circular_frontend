// src/pages/FileManager.tsx
import React from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import FileExplorer from '../components/files/FileExplorer';
import { UserType } from '../types/User';



const FileManager: React.FC = () => {
  const {
    currentOrganization,
    userType,
    setUserType,
    loading
  } = useOrganization();



  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  if (userType === 'organization') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            File Manager
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            You don't have access to any organizations.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => handleUserTypeChange('individual')}
          >
            Switch to Personal Files
          </button>
        </div>
      </div>
    );
  }




  return (
    <div className="space-y-4">

      <FileExplorer />
    </div>
  );
};

export default FileManager;