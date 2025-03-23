// src/pages/admin/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { addOrganizationUser, removeOrganizationUser } from '../../services/organization.service';
import { User } from '../../types/User';
import { getAllUsers } from '../../services/auth.service';

const UserManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    currentOrganization, 
    organizations, 
    setCurrentOrganization, 
    refreshOrganizations 
  } = useOrganization();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [adding, setAdding] = useState<boolean>(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const isSuperAdmin = currentUser?.role === 'super_admin';
  
  // Fetch organization members
  const fetchOrganizationMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentOrganization) {
        // No organization selected, clear the user list
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // Get all users from the API
      const fetchedUsers = await getAllUsers();
      
      // Check if fetchedUsers is an array before setting it
      if (Array.isArray(fetchedUsers)) {
        // Filter users to only show those in the current organization if needed
        // This depends on your data structure and requirements
        const organizationUsers = isSuperAdmin 
          ? fetchedUsers // Super admin can see all users
          : fetchedUsers.filter(user => 
              user.organizations && user.organizations.includes(currentOrganization.id)
            );
        
        setUsers(organizationUsers);
      } else {
        console.error('Expected users array, got:', fetchedUsers);
        setUsers([]); // Set empty array as fallback
        setError('Failed to load users: Invalid data format');
      }
    } catch (err: any) {
      console.error('Error fetching organization members:', err);
      setError(err.message || 'Failed to load organization members');
      setUsers([]); // Reset users on error
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrganizationMembers();
  }, [currentOrganization, isSuperAdmin]);

  const handleOrganizationChange = (orgId: string) => {
    const selectedOrg = organizations.find(org => org.id === orgId);
    if (selectedOrg) {
      setCurrentOrganization(selectedOrg);
    }
  };
  
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!currentOrganization) {
      setError('No organization selected');
      return;
    }
    
    try {
      setAdding(true);
      setError(null);
      setSuccessMessage(null);
      
      await addOrganizationUser(currentOrganization.id, { email, role });
      
      setEmail('');
      setRole('user');
      setSuccessMessage('Member added successfully');
      
      // Refresh data
      await fetchOrganizationMembers();
      await refreshOrganizations();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error adding member:', err);
      setError(err.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };
  
  const handleRemoveMember = async (userId: string) => {
    if (!currentOrganization) {
      setError('No organization selected');
      return;
    }
    
    if (userId === currentUser?.uid) {
      setError('You cannot remove yourself from the organization');
      return;
    }
    
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }
    
    try {
      setRemoving(userId);
      setError(null);
      setSuccessMessage(null);
      
      await removeOrganizationUser(currentOrganization.id, userId);
      
      setSuccessMessage('Member removed successfully');
      
      // Refresh data
      await fetchOrganizationMembers();
      await refreshOrganizations();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error removing member:', err);
      setError(err.message || 'Failed to remove member');
    } finally {
      setRemoving(null);
    }
  };
  
  return (
    <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      <p className="mt-1 text-sm text-gray-500">
        {isSuperAdmin 
          ? 'Manage users across all organizations'
          : `Manage users for ${currentOrganization?.name || 'your organization'}`}
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
    
    {successMessage && (
      <div className="rounded-md bg-green-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
          </div>
        </div>
      </div>
    )}
    
    {/* Organization Selector */}
    <div className="bg-white shadow rounded-lg p-4">
      <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
        Select Organization
      </label>
      <select
        id="organization"
        name="organization"
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        value={currentOrganization?.id || ''}
        onChange={(e) => handleOrganizationChange(e.target.value)}
      >
        <option value="" disabled>Select an organization</option>
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>
    </div>

      
      {/* Add User Form */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Add New User</h3>
          <form onSubmit={handleAddMember} className="mt-5 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Email address"
                required
              />
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <label htmlFor="role" className="sr-only">Role</label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={adding || !currentOrganization}
              className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300"
            >
              {adding ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Users List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner">Loading...</div>
        </div>
      ) : !currentOrganization ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">
            Please select an organization first.
          </p>
        </div>
      ) : users.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.displayName || 'No Name'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'super_admin' 
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'admin'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role === 'super_admin' 
                            ? 'Super Admin' 
                            : user.role === 'admin' 
                              ? 'Admin' 
                              : 'Member'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {user.id !== currentUser?.uid && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(user.id)}
                        disabled={removing === user.id}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {removing === user.id ? 'Removing...' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">
            No users found in this organization.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;