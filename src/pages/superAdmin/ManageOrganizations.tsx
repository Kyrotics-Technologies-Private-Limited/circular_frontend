import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Save, Eye } from 'lucide-react';

import { Organization } from '../../types/Organization';
import { createOrganization, deleteOrganization, getAllOrganizations, updateOrganization } from '../../services/organization.service';

const ManageOrganizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<Partial<Organization>>({
    name: '',
    CIN: '',
    status: 'pending'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteOrgId, setDeleteOrgId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch organizations from API
  useEffect(() => {
    const fetchOrganizations = async () => {
      setIsLoading(true);
      try {
        const response = await getAllOrganizations();
        setOrganizations(response);
        setFilteredOrgs(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError('Failed to load organizations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  useEffect(() => {
    // Filter and search logic
    let result = [...organizations];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(org =>
        org.name.toLowerCase().includes(term) ||
        org.CIN.toLowerCase().includes(term)
      );
    }

    setFilteredOrgs(result);
  }, [searchTerm, organizations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      CIN: '',
      status: 'pending'
    });
    setShowModal(true);
  };

  const openEditModal = (org: Organization) => {
    setModalMode('edit');
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      CIN: org.CIN,
      status: org.status
    });
    setShowModal(true);
  };

  const openViewModal = (org: Organization) => {
    setModalMode('view');
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      CIN: org.CIN,
      status: org.status
    });
    setShowModal(true);
  };

  const handleCreateOrganization = async () => {
    try {
      setError(null);
     
      const response = await createOrganization(formData as { name: string; CIN: string });

      const newOrg = response;
      setOrganizations(prev => [...prev, newOrg]);
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrg) return;

    try {
      setError(null);
      await updateOrganization(selectedOrg.id, formData);

      // Update local state
      setOrganizations(prevOrgs =>
        prevOrgs.map(org =>
          org.id === selectedOrg.id ? { ...org, ...formData } : org
        )
      );

      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update organization');
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteOrgId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteOrganization = async () => {
    if (!deleteOrgId) return;

    try {
      setError(null);
      await deleteOrganization(deleteOrgId);

      // Update local state
      setOrganizations(prevOrgs => prevOrgs.filter(org => org.id !== deleteOrgId));

      setShowDeleteConfirm(false);
      setDeleteOrgId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete organization');
      setShowDeleteConfirm(false);
    }
  };

  // Format date for display
  // const formatDate = (date: Date) => {
  //   return new Intl.DateTimeFormat('en-US', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric'
  //   }).format(new Date(date));
  // };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Organizations</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add Organization
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <span className="block sm:inline">{error}</span>
          <button
            className="float-right"
            onClick={() => setError(null)}
          >
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
          placeholder="Search organizations..."
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
      ) : filteredOrgs.length === 0 ? (
        <div className="text-center py-10 text-gray-600">
          No organizations found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CIN
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrgs.map((org) => (
                <tr key={org.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{org.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {org.CIN}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(org.status)}`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {/* {formatDate(org.createdAt)} */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openViewModal(org)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(org)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(org.id)}
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

      {/* Create/Edit/View Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {modalMode === 'create' ? 'Add New Organization' :
                  modalMode === 'edit' ? 'Edit Organization' : 'Organization Details'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Organization Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">CIN (Company Identification Number)</label>
                <input
                  type="text"
                  name="CIN"
                  value={formData.CIN}
                  onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {(modalMode === 'edit' || modalMode === 'view') && (
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}

              {selectedOrg && modalMode === 'view' && (
                <>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Owner ID</label>
                    <input
                      type="text"
                      value={selectedOrg.ownerUid}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Created At</label>
                    {/* <input
                      type="text"
                      value={formatDate(selectedOrg.createdAt)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    /> */}
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              {modalMode !== 'view' && (
                <button
                  onClick={modalMode === 'create' ? handleCreateOrganization : handleUpdateOrganization}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {modalMode === 'create' ? 'Create' : 'Update'}
                </button>
              )}
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
                Are you sure you want to delete this organization? This action cannot be undone.
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
                onClick={handleDeleteOrganization}
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

export default ManageOrganizations;