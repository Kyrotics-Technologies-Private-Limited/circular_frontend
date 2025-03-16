// src/pages/admin/AdminOrganizations.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getUserOrganizations, 
  createOrganization, 
  deleteOrganization 
} from '../../services/organization.service';
import { Organization } from '../../types/Organization';

const AdminOrganizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newOrgName, setNewOrgName] = useState<string>('');
  const [newOrgDescription, setNewOrgDescription] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  useEffect(() => {
    fetchOrganizations();
  }, []);
  
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const orgs = await getUserOrganizations();
      setOrganizations(orgs);
    } catch (err: any) {
      console.error('Error fetching organizations:', err);
      setError(err.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newOrgName.trim()) {
      setError('Organization name is required');
      return;
    }
    
    try {
      setCreating(true);
      setError(null);
      
      await createOrganization({
        name: newOrgName,
        description: newOrgDescription
      });
      
      setNewOrgName('');
      setNewOrgDescription('');
      setShowCreateForm(false);
      
      // Refresh organizations list
      await fetchOrganizations();
    } catch (err: any) {
      console.error('Error creating organization:', err);
      setError(err.message || 'Failed to create organization');
    } finally {
      setCreating(false);
    }
  };
  
  const handleDelete = async (organizationId: string) => {
    if (!window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleting(organizationId);
      setError(null);
      
      await deleteOrganization(organizationId);
      
      // Refresh organizations list
      await fetchOrganizations();
    } catch (err: any) {
      console.error('Error deleting organization:', err);
      setError(err.message || 'Failed to delete organization');
    } finally {
      setDeleting(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, manage, and delete organizations
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {showCreateForm ? 'Cancel' : 'Create Organization'}
        </button>
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
      
      {showCreateForm && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Organization</h3>
            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Organization Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  value={newOrgDescription}
                  onChange={(e) => setNewOrgDescription(e.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner">Loading...</div>
        </div>
      ) : organizations.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {organizations.map((org) => (
              <li key={org.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-md flex items-center justify-center">
                      <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500">
                        {org.members.length} {org.members.length === 1 ? 'member' : 'members'}
                      </div>
                      {org.description && (
                        <div className="text-sm text-gray-500 mt-1">{org.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/organizations/${org.id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Manage
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(org.id)}
                      disabled={deleting === org.id}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {deleting === org.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md px-4 py-5 sm:p-6 text-center">
          <p className="text-gray-500">No organizations found.</p>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Your First Organization
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrganizations;