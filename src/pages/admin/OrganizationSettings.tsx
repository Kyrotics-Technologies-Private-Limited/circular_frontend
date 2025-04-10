import React, { useState, useEffect } from 'react';
import { updateOrganization } from '../../services/organization.service';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { Organization } from '../../types/Organization';
import { Building, AlertCircle, CheckCircle, Edit, Calendar, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';

const OrganizationSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentOrganization, loading } = useOrganization();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    name: string;
    CIN: string;
  }>({
    name: '',
    CIN: ''
  });

  // Update form data when organization data changes
  useEffect(() => {
    if (currentOrganization) {
      setFormData({
        name: currentOrganization.name || '',
        CIN: currentOrganization.CIN || ''
      });
    }
  }, [currentOrganization]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization?.id) {
      toast.error('Organization ID is missing');
      return;
    }

    try {
      await updateOrganization(currentOrganization.id, formData);
      setEditMode(false);
      toast.success('Organization details updated successfully');
      
      // Reload the page to refresh organization data from context
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update organization details');
      console.error('Error updating organization:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">No organization found</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You don't seem to be part of an organization.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
            <p className="text-sm text-gray-500">
              Manage your organization profile and settings
            </p>
          </div>
          {currentOrganization.status === 'pending' && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md flex items-center">
              <AlertCircle size={20} className="mr-2" />
              <span>Organization pending approval</span>
            </div>
          )}
          {currentOrganization.status === 'approved' && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md flex items-center">
              <CheckCircle size={20} className="mr-2" />
              <span>Organization approved</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Organization Info Section */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Organization Information</h3>
                    {!editMode ? (
                      <Button
                        onClick={() => setEditMode(true)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => {
                            setEditMode(false);
                            setFormData({
                              name: currentOrganization.name || '',
                              CIN: currentOrganization.CIN || ''
                            });
                          }}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Organization Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 ${
                            !editMode ? 'bg-gray-50' : ''
                          }`}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="CIN" className="block text-sm font-medium text-gray-700">
                        CIN (Company Identification Number)
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="CIN"
                          id="CIN"
                          value={formData.CIN}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 ${
                            !editMode ? 'bg-gray-50' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Organization Details */}
                  <div className="mt-8 border-t border-gray-200 pt-8">
                    <h4 className="text-sm font-medium text-gray-500">Additional Details</h4>
                    <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Organization ID</dt>
                        <dd className="mt-1 text-sm text-gray-900">{currentOrganization.id || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            currentOrganization.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : currentOrganization.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {currentOrganization.status === 'approved'
                              ? 'Approved'
                              : currentOrganization.status === 'pending'
                              ? 'Pending Approval'
                              : 'Rejected'}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Owner</dt>
                        <dd className="mt-1 text-sm text-gray-900 flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-2">
                            <User size={16} />
                          </div>
                          <div>
                            {currentUser?.uid === currentOrganization.ownerUid 
                              ? `${currentUser.name} (You)` 
                              : currentUser?.name || 'Unknown'}
                          </div>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Created On</dt>
                        <dd className="mt-1 text-sm text-gray-900 flex items-center">
                          <Calendar size={16} className="mr-1" />
                          {currentOrganization.createdAt
                            ? new Date(currentOrganization.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Information box for status */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Building className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Organization Status Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  {currentOrganization.status === 'pending'
                    ? 'Your organization is currently pending approval from the system administrator. You will be notified once the status changes.'
                    : currentOrganization.status === 'approved'
                    ? 'Your organization is approved. You have full access to all features.'
                    : 'Your organization has been rejected. Please contact support for more information.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettings;