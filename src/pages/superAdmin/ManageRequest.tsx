import React, { useState, useEffect } from 'react';
import { Check, X, Filter, Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SignupRequest {
  id: string;
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

const ManageRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SignupRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - would be replaced with actual API call
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const mockData: SignupRequest[] = [
        {
          id: '1',
          organizationName: 'Acme Corporation',
          contactPerson: 'John Doe',
          email: 'john@acme.com',
          phone: '(555) 123-4567',
          requestDate: '2025-03-15T09:30:00',
          status: 'pending'
        },
        {
          id: '2',
          organizationName: 'Globex Industries',
          contactPerson: 'Jane Smith',
          email: 'jane@globex.com',
          phone: '(555) 987-6543',
          requestDate: '2025-03-14T14:45:00',
          status: 'pending'
        },
        {
          id: '3',
          organizationName: 'Oceanic Airlines',
          contactPerson: 'Robert Johnson',
          email: 'robert@oceanic.com',
          phone: '(555) 456-7890',
          requestDate: '2025-03-12T11:15:00',
          status: 'rejected'
        },
        {
          id: '4',
          organizationName: 'Umbrella Corporation',
          contactPerson: 'Lisa Wong',
          email: 'lisa@umbrella.com',
          phone: '(555) 234-5678',
          requestDate: '2025-03-10T16:20:00',
          status: 'approved'
        }
      ];
      
      setRequests(mockData);
      setFilteredRequests(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filter and search logic
    let result = [...requests];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(request => request.status === filterStatus);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(request => 
        request.organizationName.toLowerCase().includes(term) ||
        request.contactPerson.toLowerCase().includes(term) ||
        request.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredRequests(result);
  }, [filterStatus, searchTerm, requests]);

  const handleApprove = (id: string) => {
    // In a real app, this would be an API call
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === id ? { ...request, status: 'approved' } : request
      )
    );
  };

  const handleReject = (id: string) => {
    // In a real app, this would be an API call
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === id ? { ...request, status: 'rejected' } : request
      )
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Signup Requests</h1>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by organization, contact person or email"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-10 text-gray-600">
          No signup requests match your criteria
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
                  Contact Person
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{request.organizationName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{request.contactPerson}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{request.email}</div>
                    <div className="text-gray-500 text-sm">{request.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{formatDate(request.requestDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {request.status === 'pending' ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/super-admin/request/${request.id}`)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        {request.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageRequests;