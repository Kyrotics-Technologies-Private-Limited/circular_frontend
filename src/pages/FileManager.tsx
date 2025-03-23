// src/pages/FileManager.tsx
import React from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import FileExplorer from '../components/files/FileExplorer';
import { UserType } from '../types/User';



const FileManager: React.FC = () => {
  const { 
    organizations, 
    currentOrganization, 
    setCurrentOrganization, 
    userType,
    setUserType,
    loading 
  } = useOrganization();
  
  const handleOrganizationChange = (orgId: string) => {
    const selectedOrg = organizations.find(org => org.id === orgId);
    if (selectedOrg) {
      setCurrentOrganization(selectedOrg);
    }
  };

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
  
  // Show appropriate message for organization mode with no organizations
  if (userType === 'organization' && organizations.length === 0) {
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
  
  // Organization selector when in organization mode but no organization selected
  if (userType === 'organization' && !currentOrganization && organizations.length > 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            File Manager
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Select an organization to view files
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-4">
            <label className="inline-flex items-center mr-6">
              <input
                type="radio"
                className="form-radio"
                // checked={userType === 'individual'}
                onChange={() => handleUserTypeChange('individual')}
              />
              <span className="ml-2">Personal Files</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={userType === 'organization'}
                onChange={() => handleUserTypeChange('organization')}
              />
              <span className="ml-2">Organization Files</span>
            </label>
          </div>
          
          <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
            Select Organization
          </label>
          <select
            id="organization"
            name="organization"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value=""
            onChange={(e) => handleOrganizationChange(e.target.value)}
          >
            <option value="" disabled>Select an organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }
  
  // Show file explorer with a mode switcher at the top
  return (
    <div className="space-y-4">
      {/* <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {userType === 'individual' ? 'Personal Files' : `${currentOrganization?.name} Files`}
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white p-2 rounded shadow">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={userType === 'individual'}
                onChange={() => handleUserTypeChange('individual')}
              />
              <span className="ml-2 text-sm">Personal</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={userType === 'organization'}
                onChange={() => handleUserTypeChange('organization')}
              />
              <span className="ml-2 text-sm">Organization</span>
            </label>
          </div>
          
          {userType === 'organization' && organizations.length > 0 && (
            <select
              className="pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              value={currentOrganization?.id || ''}
              onChange={(e) => handleOrganizationChange(e.target.value)}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          )}
        </div>
      </div> */}
      
      <FileExplorer />
    </div>
  );
};

export default FileManager;