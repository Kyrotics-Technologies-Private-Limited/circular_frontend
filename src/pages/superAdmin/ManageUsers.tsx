import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Save, RefreshCw, User as UserIcon, AlertCircle, Ban, CircleCheckBig } from 'lucide-react';
import { getAllUsers, disableUser, enableUser } from '../../services/auth.service';
import { getAllOrganizations, getOrganizationUsers } from '../../services/organization.service';
import { toast } from 'react-toastify';
import { User } from '../../types/User';
import { Organization } from '../../types/Organization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import Loader from '@/components/ui/loader';

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
    role: 'user',
    status: 'approved',
    userType: 'individual',
    orgId: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const orgsData = await getAllOrganizations();
        setOrganizations(orgsData);

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
    let result = [...users];

    if (userTypeFilter !== 'all') {
      result = result.filter(user => user.userType === userTypeFilter);
    }

    if (selectedOrgFilter !== 'all') {
      result = result.filter(user =>
        user.userType === 'organization' && user.orgId === selectedOrgFilter
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user =>
        (user.name && user.name.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term))
      );
    }

    setFilteredUsers(result);
  }, [searchTerm, userTypeFilter, selectedOrgFilter, users]);

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
      toast.success('User created successfully');
      setShowModal(false);

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
      toast.success('User updated successfully');
      setShowModal(false);

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

  const selectClass =
    "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  const actionButtonClass =
    "h-8 w-8 p-0 rounded-lg inline-flex items-center justify-center";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage all users across the platform
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex flex-col md:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className={selectClass}
            >
              <option value="all">All Users</option>
              <option value="individual">Individual</option>
              <option value="organization">Organizational</option>
            </select>

            {(userTypeFilter === 'organization' || userTypeFilter === 'all') && (
              <select
                value={selectedOrgFilter}
                onChange={(e) => setSelectedOrgFilter(e.target.value)}
                className={selectClass}
              >
                <option value="all">All Organizations</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            )}

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setUserTypeFilter('all');
                setSelectedOrgFilter('all');
              }}
              title="Reset Filters"
              className="h-10 w-10 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No users match your criteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr>
                  {["Name", "Email", "Type", "Organization", "Role", "Status", "Last Login", "Actions"].map((h, i) => (
                    <th
                      key={h}
                      scope="col"
                      className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                        i === 7 ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.uid || user.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                          {(user.name || user.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 font-medium text-foreground">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.userType === 'individual' ? (
                        <Badge variant="secondary" className="gap-1.5">
                          <UserIcon className="h-3 w-3" />
                          Individual
                        </Badge>
                      ) : (
                        <Badge variant="info" className="gap-1.5">
                          Organizational
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {user.orgId ? (
                        organizations.find(org => org.id === user.orgId)?.name || 'Unknown'
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'super_admin' ? (
                        <Badge variant="destructive">Super Admin</Badge>
                      ) : user.role === 'admin' ? (
                        <Badge variant="secondary">Admin</Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.status === 'approved' ? (
                        <Badge variant="success">Approved</Badge>
                      ) : user.status === 'pending' ? (
                        <Badge variant="warning">Pending</Badge>
                      ) : (
                        <Badge variant="destructive">Rejected</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          onClick={() => openEditModal(user)}
                          variant="outline"
                          className={actionButtonClass}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          onClick={() => confirmDelete(user.uid || user.id || '')}
                          variant="outline"
                          className={actionButtonClass}
                          title={user.disabled ? "Enable User" : "Disable User"}
                        >
                          {user.disabled ? (
                            <CircleCheckBig className="h-4 w-4 text-green-600" />
                          ) : (
                            <Ban className="h-4 w-4 text-amber-600" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        size="lg"
        title={modalMode === 'create' ? 'Add New User' : 'Edit User'}
        description={
          modalMode === 'create'
            ? 'Create a new user account'
            : 'Update user account details'
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={modalMode === 'create' ? handleCreateUser : handleUpdateUser}>
              <Save className="h-4 w-4 mr-1" />
              {modalMode === 'create' ? 'Create' : 'Update'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
            <Input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">User Type</label>
            <select
              name="userType"
              value={formData.userType || 'individual'}
              onChange={handleInputChange}
              className={selectClass}
            >
              <option value="individual">Individual</option>
              <option value="organization">Organizational</option>
            </select>
          </div>

          {formData.userType === 'organization' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Organization</label>
              <select
                name="orgId"
                value={formData.orgId || ''}
                onChange={handleInputChange}
                className={selectClass}
              >
                <option value="">Select Organization</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
            <select
              name="role"
              value={formData.role || 'user'}
              onChange={handleInputChange}
              className={selectClass}
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
            <select
              name="status"
              value={formData.status || 'approved'}
              onChange={handleInputChange}
              className={selectClass}
            >
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Action"
        description={`Are you sure you want to ${
          users.find(u => (u.uid || u.id) === deleteUserId)?.disabled
            ? 'enable'
            : 'disable'
        } this user?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const user = users.find(u => (u.uid || u.id) === deleteUserId);
                if (user && deleteUserId) {
                  handleToggleUserStatus(deleteUserId, Boolean(user.disabled));
                }
              }}
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          The user&apos;s access will be updated immediately.
        </p>
      </Modal>
    </div>
  );
};

export default ManageUsers;
