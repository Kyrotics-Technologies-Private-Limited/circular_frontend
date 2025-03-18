import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Save, Eye } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  industry: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  employees: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

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
    industry: '',
    address: '',
    contactPerson: '',
    email: '',
    phone: '',
    employees: 0,
    status: 'active'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteOrgId, setDeleteOrgId] = useState<string | null>(null);

  // Mock data - would be replaced with actual API call
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const mockData: Organization[] = [
        {
          id: '1',
          name: 'Acme Corporation',
          industry: 'Manufacturing',
          address: '123 Main St, Anytown, USA',
          contactPerson: 'John Doe',
          email: 'john@acme.com',
          phone: '(555) 123-4567',
          employees: 240,
          status: 'active',
          createdAt: '2023-09-15T09:30:00'
        },
        {
          id: '2',
          name: 'Globex Industries',
          industry: 'Technology',
          address: '456 Tech Park, Innovation City',
          contactPerson: 'Jane Smith',
          email: 'jane@globex.com',
          phone: '(555) 987-6543',
          employees: 112,
          status: 'active',
          createdAt: '2023-11-20T14:45:00'
        },
        {
          id: '3',
          name: 'Oceanic Airlines',
          industry: 'Transportation',
          address: '789 Sky Harbor, Flightville',
          contactPerson: 'Robert Johnson',
          email: 'robert@oceanic.com',
          phone: '(555) 456-7890',
          employees: 537,
          status: 'inactive',
          createdAt: '2022-06-12T11:15:00'
        },
        {
          id: '4',
          name: 'Umbrella Corporation',
          industry: 'Pharmaceutical',
          address: '321 Lab Lane, Research Heights',
          contactPerson: 'Lisa Wong',
          email: 'lisa@umbrella.com',
          phone: '(555) 234-5678',
          employees: 189,
          status: 'active',
          createdAt: '2024-01-10T16:20:00'
        },
        {
          id: '5',
          name: 'Stark Industries',
          industry: 'Defense Technology',
          address: '10880 Malibu Point, Malibu',
          contactPerson: 'Tony Stark',
          email: 'tony@stark.com',
          phone: '(555) 111-2222',
          employees: 345,
          status: 'active',
          createdAt: '2023-04-05T10:10:00'
        }
      ];
      
      setOrganizations(mockData);
      setFilteredOrgs(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filter and search logic
    let result = [...organizations];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(org => 
        org.name.toLowerCase().includes(term) ||
        org.industry.toLowerCase().includes(term) ||
        org.contactPerson.toLowerCase().includes(term) ||
        org.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredOrgs(result);
  }, [searchTerm, organizations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'employees' ? parseInt(value) || 0 : value
    }));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      industry: '',
      address: '',
      contactPerson: '',
      email: '',
      phone: '',
      employees: 0,
      status: 'active'
    });
    setShowModal(true);
  };

  const openEditModal = (org: Organization) => {
    setModalMode('edit');
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      industry: org.industry,
      address: org.address,
      contactPerson: org.contactPerson,
      email: org.email,
      phone: org.phone,
      employees: org.employees,
      status: org.status
    });
    setShowModal(true);
  };

  const openViewModal = (org: Organization) => {
    setModalMode('view');
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      industry: org.industry,
      address: org.address,
      contactPerson: org.contactPerson,
      email: org.email,
      phone: org.phone,
      employees: org.employees,
      status: org.status
    });
    setShowModal(true);
  };

  const handleCreateOrganization = () => {
    // In a real app, this would be an API call
    const newOrg: Organization = {
      id: `${organizations.length + 1}`,
      ...formData as Omit<Organization, 'id' | 'createdAt'>,
      createdAt: new Date().toISOString()
    };
    
    setOrganizations(prev => [...prev, newOrg]);
    setShowModal(false);
  };

  const handleUpdateOrganization = () => {
    if (!selectedOrg) return;
    
    // In a real app, this would be an API call
    setOrganizations(prevOrgs => 
      prevOrgs.map(org => 
        org.id === selectedOrg.id ? { ...org, ...formData } : org
      )
    );
    
    setShowModal(false);
  };

  const confirmDelete = (id: string) => {
    setDeleteOrgId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteOrganization = () => {
    if (!deleteOrgId) return;
    
    // In a real app, this would be an API call
    setOrganizations(prevOrgs => prevOrgs.filter(org => org.id !== deleteOrgId));
    
    setShowDeleteConfirm(false);
    setDeleteOrgId(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
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
                  Industry
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Person
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
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
                    {org.industry}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{org.contactPerson}</div>
                    <div className="text-gray-500 text-sm">{org.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {org.employees.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {formatDate(org.createdAt)}
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
      
      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {modalMode === 'create' ? 'Add New Organization' : 
                 modalMode === 'edit' ? 'Edit Organization' : 'Organization Details'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
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
                <label className="block text-gray-700 text-sm font-medium mb-1">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Number of Employees</label>
                <input
                  type="number"
                  name="employees"
                  value={formData.employees}
                  onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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