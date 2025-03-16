// src/pages/FileManager.tsx
import React from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import FileExplorer from '../components/files/FileExplorer';

const FileManager: React.FC = () => {
  const { organizations, currentOrganization, setCurrentOrganization, loading } = useOrganization();
  
  const handleOrganizationChange = (orgId: string) => {
    const selectedOrg = organizations.find(org => org.id === orgId);
    if (selectedOrg) {
      setCurrentOrganization(selectedOrg);
    }
  };
  
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
            You don't have access to any organizations.
          </p>
        </div>
      </div>
    );
  }
  
  if (!currentOrganization) {
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
  
  return <FileExplorer />;
};

export default FileManager;