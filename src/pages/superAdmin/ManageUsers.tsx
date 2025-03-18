import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Save, RefreshCw, ChevronDown } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: 'individual' | 'organizational';
  organizationId?: string;
  organizationName?: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
}

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
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    type: 'individual',
    organizationId: '',
    role: '',
    status: 'active'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Mock data - would be replaced with actual API calls
  useEffect(() => {
    // Simulate API fetch for Organizations
    setTimeout(() => {
      const mockOrgs: Organization[] = [
        { id: '1', name: 'Acme Corporation' },
        { id: '2', name: 'Globex Industries' },
        { id: '3', name: 'Oceanic Airlines' },
        { id: '4', name: 'Umbrella Corporation' },
        { id: '5', name: 'Stark Industries' }
      ];
      
      setOrganizations(mockOrgs);
      
      // Then fetch Users
      const mockUsers: User[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '(555) 123-4567',
          type: 'organizational',
          organizationId: '1',
          organizationName: 'Acme Corporation',
          role: 'Admin',
          status: 'active',
          lastLogin: '2025-03-17T09:30:00',
          createdAt: '2024-10-15T09:30:00'
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '(555) 987-6543',
          type: 'organizational',
          organizationId: '1',
          organizationName: 'Acme Corporation',
          role: 'User',
          status: 'active',
          lastLogin: '2025-03-15T14:45:00',
          createdAt: '2024-10-20T14:45:00'
        },
        {
          id: '3',
          firstName: 'Robert',
          lastName: 'Johnson',
          email: 'robert@oceanic.com',
          phone: '(555) 456-7890',
          type: 'organizational',
          organizationId: '3',
          organizationName: 'Oceanic Airlines',
          role: 'Admin',
          status: 'active',
          lastLogin: '2025-03-16T11:15:00',
          createdAt: '2024-09-12T11:15:00'
        },
        {
          id: '4',
          firstName: 'Lisa',
          lastName: 'Wong',
          email: 'lisa@personal.com',
          phone: '(555) 234-5678',
          type: 'individual',
          role: 'User',
          status: 'active',
          lastLogin: '2025-03-14T16:20:00',
          createdAt: '2024-11-10T16:20:00'
        },
        {
          id: '5',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael@personal.com',
          phone: '(555) 876-5432',
          type: 'individual',
          role: 'User',
          status: 'suspended',
          lastLogin: '2025-02-28T10:10:00',
          createdAt: '2024-08-05T10:10:00'
        },
        {
          id: '6',
          firstName: 'Emma',
          lastName: 'Davis',
          email: 'emma@stark.com',
          phone: '(555) 111-2222',
          type: 'organizational',
          organizationId: '5',
          organizationName: 'Stark Industries',
          role: 'Admin',
          status: 'inactive',
          lastLogin: '2025-03-01T08:20:00',
          createdAt: '2024-07-15T08:20:00'
        }
      ];
      
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filter and search logic
    let result = [...users];
    
    // Apply user type filter
    if (userTypeFilter !== 'all') {
      result = result.filter(user => user.type === userTypeFilter);
    }
    
    // Apply organization filter (only for organizational users)
    if (selectedOrgFilter !== 'all') {
      result = result.filter(user => 
        user.type === 'organizational' && user.organizationId === selectedOrgFilter
      );
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.organizationName && user.organizationName.toLowerCase().includes(term))
      );
    }
    
    setFilteredUsers(result);
  }, [searchTerm, userTypeFilter, selectedOrgFilter, users]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'type' && value === 'individual') {
      // Clear organization related fields if switching to individual user type
      setFormData(prev => ({
        ...prev,
        [name]: value,
        organizationId: '',
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
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      type: 'individual',
      organizationId: '',
      role: 'User',
      status: 'active'
    });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      type: user.type,
      organizationId: user.organizationId || '',
      role: user.role,
      status: user.status
    });
    setShowModal(true);
  };

  const handleCreateUser = () => {
    // In a real app, this would be an API call
    const newUser: User = {
      id: `${users.length + 1}`,
      ...formData as Required<Omit<User, 'id' | 'lastLogin' | 'createdAt' | 'organizationName'>>,
      lastLogin: '',
      createdAt: new Date().toISOString(),
      organizationName: formData.type === 'organizational' && formData.organizationId
        ? organizations.find(org => org.id === formData.organizationId)?.name
        : undefined
    };
    
    setUsers(prev => [...prev, newUser]);
    setShowModal(false);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    
    // In a real app, this would be an API call
    const updatedUser = {
      ...selectedUser,
      ...formData,
      organizationName: formData.type === 'organizational' && formData.organizationId
        ? organizations.find(org => org.id === formData.organizationId)?.name
        : undefined
    };
    
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      )
    );
    
    setShowModal(false);
  };

  const confirmDelete = (id: string) => {
    setDeleteUserId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteUser = () => {
    if (!deleteUserId) return;
    
    // In a real app, this would be an API call
    setUsers(prevUsers => prevUsers.filter(user => user.id !== deleteUserId));
    
    setShowDeleteConfirm(false);
    setDeleteUserId(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add User
        </button>
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
            <option value="organizational">Organizational</option>
          </select>
          
          {(userTypeFilter === 'organizational' || userTypeFilter === 'all') && (
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
          
          <button
            onClick={() => {
              setSearchTerm('');
              setUserTypeFilter('all');
              setSelectedOrgFilter('all');
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded flex items-center"
            title="Reset Filters"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
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
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.type === 'individual' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {user.organizationName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                        user.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(user.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">User Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="individual">Individual</option>
                  <option value="organizational">Organizational</option>
                </select>
              </div>
              
              {formData.type === 'organizational' && (
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Organization</label>
                  <select
                    name="organizationId"
                    value={formData.organizationId}
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
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={modalMode === 'create' ? handleCreateUser : handleUpdateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                {modalMode === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Confirm Deletion</h2>
              <p className="text-gray-600 mt-2">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;