// // src/pages/admin/UserManagement.tsx
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { useOrganization } from '../../contexts/OrganizationContext';
// import { addOrganizationUser, removeOrganizationUser } from '../../services/organization.service';
// import { User } from '../../types/User';
// import { getAllUsers } from '../../services/auth.service';

// const UserManagement: React.FC = () => {
//   const { currentUser } = useAuth();
//   const { 
//     currentOrganization, 
//     organizations, 
//     setCurrentOrganization, 
//     refreshOrganizations 
//   } = useOrganization();
  
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [email, setEmail] = useState<string>('');
//   const [role, setRole] = useState<'user' | 'admin'>('user');
//   const [adding, setAdding] = useState<boolean>(false);
//   const [removing, setRemoving] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
//   const isSuperAdmin = currentUser?.role === 'super_admin';
  
//   // Fetch organization members
//   const fetchOrganizationMembers = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       if (!currentOrganization) {
//         // No organization selected, clear the user list
//         setUsers([]);
//         setLoading(false);
//         return;
//       }
      
//       // Get all users from the API
//       const fetchedUsers = await getAllUsers();
      
//       // Check if fetchedUsers is an array before setting it
//       if (Array.isArray(fetchedUsers)) {
//         // Filter users to only show those in the current organization if needed
//         // This depends on your data structure and requirements
//         const organizationUsers = isSuperAdmin 
//           ? fetchedUsers // Super admin can see all users
//           : fetchedUsers.filter(user => 
//               user.organizations && user.organizations.includes(currentOrganization.id)
//             );
        
//         setUsers(organizationUsers);
//       } else {
//         console.error('Expected users array, got:', fetchedUsers);
//         setUsers([]); // Set empty array as fallback
//         setError('Failed to load users: Invalid data format');
//       }
//     } catch (err: any) {
//       console.error('Error fetching organization members:', err);
//       setError(err.message || 'Failed to load organization members');
//       setUsers([]); // Reset users on error
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   useEffect(() => {
//     fetchOrganizationMembers();
//   }, [currentOrganization, isSuperAdmin]);

//   const handleOrganizationChange = (orgId: string) => {
//     const selectedOrg = organizations.find(org => org.id === orgId);
//     if (selectedOrg) {
//       setCurrentOrganization(selectedOrg);
//     }
//   };
  
//   const handleAddMember = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!email.trim()) {
//       setError('Email is required');
//       return;
//     }
    
//     if (!currentOrganization) {
//       setError('No organization selected');
//       return;
//     }
    
//     try {
//       setAdding(true);
//       setError(null);
//       setSuccessMessage(null);
      
//       await addOrganizationUser(currentOrganization.id, { email, role });
      
//       setEmail('');
//       setRole('user');
//       setSuccessMessage('Member added successfully');
      
//       // Refresh data
//       await fetchOrganizationMembers();
//       await refreshOrganizations();
      
//       // Clear success message after 3 seconds
//       setTimeout(() => {
//         setSuccessMessage(null);
//       }, 3000);
//     } catch (err: any) {
//       console.error('Error adding member:', err);
//       setError(err.message || 'Failed to add member');
//     } finally {
//       setAdding(false);
//     }
//   };
  
//   const handleRemoveMember = async (userId: string) => {
//     if (!currentOrganization) {
//       setError('No organization selected');
//       return;
//     }
    
//     if (userId === currentUser?.uid) {
//       setError('You cannot remove yourself from the organization');
//       return;
//     }
    
//     if (!window.confirm('Are you sure you want to remove this member?')) {
//       return;
//     }
    
//     try {
//       setRemoving(userId);
//       setError(null);
//       setSuccessMessage(null);
      
//       await removeOrganizationUser(currentOrganization.id, userId);
      
//       setSuccessMessage('Member removed successfully');
      
//       // Refresh data
//       await fetchOrganizationMembers();
//       await refreshOrganizations();
      
//       // Clear success message after 3 seconds
//       setTimeout(() => {
//         setSuccessMessage(null);
//       }, 3000);
//     } catch (err: any) {
//       console.error('Error removing member:', err);
//       setError(err.message || 'Failed to remove member');
//     } finally {
//       setRemoving(null);
//     }
//   };
  
//   return (
//     <div className="space-y-6">
//     <div>
//       <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
//       <p className="mt-1 text-sm text-gray-500">
//         {isSuperAdmin 
//           ? 'Manage users across all organizations'
//           : `Manage users for ${currentOrganization?.name || 'your organization'}`}
//       </p>
//     </div>
    
//     {error && (
//       <div className="rounded-md bg-red-50 p-4">
//         <div className="flex">
//           <div className="ml-3">
//             <h3 className="text-sm font-medium text-red-800">{error}</h3>
//           </div>
//         </div>
//       </div>
//     )}
    
//     {successMessage && (
//       <div className="rounded-md bg-green-50 p-4">
//         <div className="flex">
//           <div className="ml-3">
//             <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
//           </div>
//         </div>
//       </div>
//     )}
    
//     {/* Organization Selector */}
//     <div className="bg-white shadow rounded-lg p-4">
//       <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
//         Select Organization
//       </label>
//       <select
//         id="organization"
//         name="organization"
//         className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
//         value={currentOrganization?.id || ''}
//         onChange={(e) => handleOrganizationChange(e.target.value)}
//       >
//         <option value="" disabled>Select an organization</option>
//         {organizations.map((org) => (
//           <option key={org.id} value={org.id}>{org.name}</option>
//         ))}
//       </select>
//     </div>

      
//       {/* Add User Form */}
//       <div className="bg-white shadow overflow-hidden sm:rounded-lg">
//         <div className="px-4 py-5 sm:p-6">
//           <h3 className="text-lg leading-6 font-medium text-gray-900">Add New User</h3>
//           <form onSubmit={handleAddMember} className="mt-5 sm:flex sm:items-center">
//             <div className="w-full sm:max-w-xs">
//               <label htmlFor="email" className="sr-only">Email</label>
//               <input
//                 type="email"
//                 name="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
//                 placeholder="Email address"
//                 required
//               />
//             </div>
//             <div className="mt-3 sm:mt-0 sm:ml-3">
//               <label htmlFor="role" className="sr-only">Role</label>
//               <select
//                 id="role"
//                 name="role"
//                 value={role}
//                 onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
//                 className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
//               >
//                 <option value="member">Member</option>
//                 <option value="admin">Admin</option>
//               </select>
//             </div>
//             <button
//               type="submit"
//               disabled={adding || !currentOrganization}
//               className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300"
//             >
//               {adding ? 'Adding...' : 'Add User'}
//             </button>
//           </form>
//         </div>
//       </div>
      
//       {/* Users List */}
//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="spinner">Loading...</div>
//         </div>
//       ) : !currentOrganization ? (
//         <div className="bg-white shadow rounded-lg p-6 text-center">
//           <p className="text-gray-500">
//             Please select an organization first.
//           </p>
//         </div>
//       ) : users.length > 0 ? (
//         <div className="bg-white shadow overflow-hidden sm:rounded-md">
//           <ul className="divide-y divide-gray-200">
//             {users.map((user) => (
//               <li key={user.id}>
//                 <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
//                       {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
//                     </div>
//                     <div className="ml-4">
//                       <div className="text-sm font-medium text-gray-900">
//                         {user.displayName || 'No Name'}
//                       </div>
//                       <div className="text-sm text-gray-500">{user.email}</div>
//                       <div className="text-xs mt-1">
//                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           user.role === 'super_admin' 
//                             ? 'bg-purple-100 text-purple-800'
//                             : user.role === 'admin'
//                               ? 'bg-indigo-100 text-indigo-800'
//                               : 'bg-green-100 text-green-800'
//                         }`}>
//                           {user.role === 'super_admin' 
//                             ? 'Super Admin' 
//                             : user.role === 'admin' 
//                               ? 'Admin' 
//                               : 'Member'}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                   <div>
//                     {user.id !== currentUser?.uid && (
//                       <button
//                         type="button"
//                         onClick={() => handleRemoveMember(user.id)}
//                         disabled={removing === user.id}
//                         className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
//                       >
//                         {removing === user.id ? 'Removing...' : 'Remove'}
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       ) : (
//         <div className="bg-white shadow rounded-lg p-6 text-center">
//           <p className="text-gray-500">
//             No users found in this organization.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement;

import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, X, Save, Check, Shield } from 'lucide-react';
// import axios from 'axios';

import { User, UserRole} from '../../types/User';
import { getOrganizationUsers, addOrganizationUser, removeOrganizationUser, updateUserRole } from '../../services/organization.service';
import { useOrganization } from '../../contexts/OrganizationContext';


const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    role: 'user' as UserRole
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id || '';

  // Fetch organization users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching users for organization:', organizationId);
        
        if (!organizationId) {
          setUsers([]);
          setFilteredUsers([]);
          setError('No organization selected');
          setIsLoading(false);
          return;
        }
        
        const users = await getOrganizationUsers(organizationId);
        console.log('Fetched users:', users);
        setUsers(users);
        setFilteredUsers(users);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [organizationId]);

  useEffect(() => {
    // Filter and search logic
    let result = [...users];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.displayName?.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredUsers(result);
  }, [searchTerm, users]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      email: '',
      role: 'user'
    });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      email: user.email,
      role: user.role
    });
    setShowModal(true);
  };

  const handleAddUser = async () => {
    try {
      setError(null);
      await addOrganizationUser(organizationId, formData);
      
      // Show success message
      setSuccess('User added successfully');
      
      // Refresh user list
      const users = await getOrganizationUsers(organizationId);
      setUsers(users);
      
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
  };

  const handleUpdateUserRole = async () => {
    if (!selectedUser) return;
    
    try {
      setError(null);
      await updateUserRole(organizationId, selectedUser.id, {
        role: formData.role
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id ? { ...user, role: formData.role as UserRole } : user
        )
      );
      
      // Show success message
      setSuccess('User role updated successfully');
      
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const confirmRemoveUser = (userId: string) => {
    setDeleteUserId(userId);
    setShowDeleteConfirm(true);
  };

  const handleRemoveUser = async () => {
    if (!deleteUserId) return;
    
    try {
      setError(null);
      await removeOrganizationUser(organizationId, deleteUserId);
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== deleteUserId));
      
      // Show success message
      setSuccess('User removed from organization successfully');
      
      setShowDeleteConfirm(false);
      setDeleteUserId(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove user');
      setShowDeleteConfirm(false);
    }
  };

  // Get role badge
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </span>
        );
      case 'user':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            User
          </span>
        );
      case 'super_admin':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            <Shield className="h-3 w-3 mr-1" />
            Super Admin
          </span>
        );
      default:
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            {role}
          </span>
        );
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Organization Users</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <UserPlus className="h-5 w-5 mr-1" />
          Add User
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {/* Success message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span className="flex items-center">
            <Check className="h-5 w-5 mr-1" />
            {success}
          </span>
          <button onClick={() => setSuccess(null)}>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {/* Search */}
      <div className="relative mb-6">
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
      
      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-10 text-gray-600">
          No users found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
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
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded"
                        title="Edit Role"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmRemoveUser(user.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded"
                        title="Remove from Organization"
                        disabled={user.id === users.find(u => u.role === 'admin')?.id && users.filter(u => u.role === 'admin').length === 1}
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
      
      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {modalMode === 'add' ? 'Add User to Organization' : 'Edit User Role'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {modalMode === 'add' && (
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">User Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@example.com"
                  />
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
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
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
                onClick={modalMode === 'add' ? handleAddUser : handleUpdateUserRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                {modalMode === 'add' ? 'Add User' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Remove User Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Confirm Removal</h2>
              <p className="text-gray-600 mt-2">
                Are you sure you want to remove this user from the organization? They will lose access to all organization resources.
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
                onClick={handleRemoveUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;