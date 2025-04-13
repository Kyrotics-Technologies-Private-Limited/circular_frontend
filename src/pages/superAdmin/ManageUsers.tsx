import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Save, RefreshCw } from 'lucide-react';
import { getAllUsers, disableUser, enableUser } from '../../services/auth.service';
import { getAllOrganizations, getOrganizationUsers } from '../../services/organization.service';
import { toast } from 'react-toastify';
import { User } from '../../types/User';
import { Organization } from '../../types/Organization';
import { Button } from '@/components/ui/button';

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'user', // Replace with a valid UserRole value or undefined
    status: 'approved',
    userType: 'individual',
    orgId: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Fetch organizations and users from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch organizations
        const orgsData = await getAllOrganizations();
        setOrganizations(orgsData);
        
        // Fetch all users
        const usersData = await getAllUsers();
        if (Array.isArray(usersData)) {
          setUsers(usersData);
          setFilteredUsers(usersData);
        } else {
          console.error('Expected array of users but got:', usersData);
          setUsers([]);
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load users and organizations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter and search logic
    let result = [...users];
    
    // Apply user type filter
    if (userTypeFilter !== 'all') {
      result = result.filter(user => user.userType === userTypeFilter);
    }
    
    // Apply organization filter (only for organizational users)
    if (selectedOrgFilter !== 'all') {
      result = result.filter(user => 
        user.userType === 'organization' && user.orgId === selectedOrgFilter
      );
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.name && user.name.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term))
      );
    }
    
    setFilteredUsers(result);
  }, [searchTerm, userTypeFilter, selectedOrgFilter, users]);

  // Load organization users when selecting an organization filter
  useEffect(() => {
    const loadOrgUsers = async () => {
      if (selectedOrgFilter !== 'all') {
        try {
          setIsLoading(true);
          const orgUsers = await getOrganizationUsers(selectedOrgFilter);
          if (Array.isArray(orgUsers)) {
            setFilteredUsers(orgUsers);
          }
        } catch (error) {
          console.error('Error fetching organization users:', error);
          toast.error('Failed to load organization users');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (selectedOrgFilter !== 'all') {
      loadOrgUsers();
    }
  }, [selectedOrgFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'userType' && value === 'individual') {
      // Clear organization related fields if switching to individual user type
      setFormData(prev => ({
        ...prev,
        [name]: value,
        orgId: '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      email: '',
      userType: 'individual',
      orgId: '',
      role: 'user',
      status: 'approved'
    });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      userType: user.userType || 'individual',
      orgId: user.orgId || '',
      role: user.role || 'user',
      status: user.status || 'approved'
    });
    setShowModal(true);
  };

  const handleCreateUser = async () => {
    try {
      // This would use your API service for creating users
      // For example: await createUser(formData);
      
      toast.success('User created successfully');
      setShowModal(false);
      
      // Refresh user list after creating
      const updatedUsers = await getAllUsers();
      if (Array.isArray(updatedUsers)) {
        setUsers(updatedUsers);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      // This would use your API service for updating users
      // For example: await updateUser(selectedUser.id, formData);
      
      toast.success('User updated successfully');
      setShowModal(false);
      
      // Refresh user list after updating
      const updatedUsers = await getAllUsers();
      if (Array.isArray(updatedUsers)) {
        setUsers(updatedUsers);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteUserId(id);
    setShowDeleteConfirm(true);
  };

  const handleToggleUserStatus = async (uid: string, isDisabled: boolean) => {
    try {
      if (isDisabled) {
        await enableUser(uid);
        toast.success('User has been enabled');
      } else {
        await disableUser(uid);
        toast.success('User has been disabled');
      }
      
      // Refresh user list after status change
      const updatedUsers = await getAllUsers();
      if (Array.isArray(updatedUsers)) {
        setUsers(updatedUsers);
      }
      
      setShowDeleteConfirm(false);
      setDeleteUserId(null);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  // Format date for display
  // const formatDate = (dateString: string | Date | undefined) => {
  //   if (!dateString) return 'Never';
  //   const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  //   return new Intl.DateTimeFormat('en-US', {
  //     year: 'numeric', 
  //     month: 'short', 
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   }).format(date);
  // };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <Button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add User
        </Button>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="individual">Individual</option>
            <option value="organization">Organizational</option>
          </select>
          
          {(userTypeFilter === 'organization' || userTypeFilter === 'all') && (
            <select
              value={selectedOrgFilter}
              onChange={(e) => setSelectedOrgFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Organizations</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          )}
          
          <Button
            onClick={() => {
              setSearchTerm('');
              setUserTypeFilter('all');
              setSelectedOrgFilter('all');
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded flex items-center"
            title="Reset Filters"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-10 text-gray-600">
          No users match your criteria
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.uid || user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.userType === 'individual' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.userType === 'individual' ? 'Individual' : 'Organizational'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {user.orgId ? (
                      organizations.find(org => org.id === user.orgId)?.name || 'Unknown'
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {user.role === 'super_admin' ? 'Super Admin' : 
                      user.role === 'admin' ? 'Admin' : 'User'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {user.status === 'approved' ? 'Approved' : 
                       user.status === 'pending' ? 'Pending' : 'Rejected'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {/* {formatDate(user.lastLogin)} */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => openEditModal(user)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => confirmDelete(user.uid || user.id || '')}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded"
                        title={user.disabled ? "Enable User" : "Disable User"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {modalMode === 'create' ? 'Add New User' : 'Edit User'}
              </h2>
              <Button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">User Type</label>
                <select
                  name="userType"
                  value={formData.userType || 'individual'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="individual">Individual</option>
                  <option value="organization">Organizational</option>
                </select>
              </div>
              
              {formData.userType === 'organization' && (
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Organization</label>
                  <select
                    name="orgId"
                    value={formData.orgId || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role || 'user'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status || 'approved'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={modalMode === 'create' ? handleCreateUser : handleUpdateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                {modalMode === 'create' ? 'Create' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete/Disable Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Confirm Action</h2>
              <p className="text-gray-600 mt-2">
                Are you sure you want to {
                  users.find(u => (u.uid || u.id) === deleteUserId)?.disabled 
                    ? 'enable' 
                    : 'disable'
                } this user?
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  const user = users.find(u => (u.uid || u.id) === deleteUserId);
                  if (user && deleteUserId) {
                    handleToggleUserStatus(deleteUserId, Boolean(user.disabled));
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;