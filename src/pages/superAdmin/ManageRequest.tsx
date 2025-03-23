// src/components/admin/ManageRequests.tsx
import React, { useState, useEffect } from 'react';
import { Check, X, Eye, AlertTriangle, Clock, Search } from 'lucide-react';
import { Request, getAllRequests, approveRequest, rejectRequest } from '../../services/request.service';

const ManageRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllRequests();
        setRequests(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching organization requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Filter and search requests
  const filteredRequests = requests.filter(request => {
    // Apply status filter
    if (filter !== 'all' && request.status !== filter) {
      return false;
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        request.organizationName.toLowerCase().includes(term) ||
        request.CIN.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  const handleApprove = async (requestId: string) => {
    try {
      setError(null);
      await approveRequest(requestId);

      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === requestId ? { ...req, status: 'approved', processedAt: new Date() } : req
        )
      );

      setSuccess('Organization request approved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error approving request');
    }
  };

  const openRejectModal = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedRequestId) return;

    try {
      setError(null);
      await rejectRequest(selectedRequestId, rejectionReason);

      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === selectedRequestId ? { 
            ...req, 
            status: 'rejected', 
            processedAt: new Date(),
            rejectionReason
          } : req
        )
      );

      setShowRejectModal(false);
      setSelectedRequestId(null);
      setSuccess('Organization request rejected successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error rejecting request');
      setShowRejectModal(false);
    }
  };

  const openViewModal = (request: Request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Organization Requests</h1>
        <p className="text-gray-600">Review and process organization registration requests</p>
      </div>

      {/* Error and success messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </span>
          <button onClick={() => setError(null)}>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span className="flex items-center">
            <Check className="h-5 w-5 mr-2" />
            {success}
          </span>
          <button onClick={() => setSuccess(null)}>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative md:w-1/2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by organization name or CIN"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:w-1/4">
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-10 text-gray-600">
          No organization requests found
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
                  Requested On
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
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {request.CIN}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {/* {formatDate(request.createdAt)} */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openViewModal(request)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openRejectModal(request.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Reject Organization Request</h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this organization registration request.
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Rejection Reason</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Invalid CIN, Incomplete information, etc."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={!rejectionReason.trim()}
              >
                <X className="h-4 w-4 mr-1" />
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View request details modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Organization Request Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Organization Name</h3>
                <p className="mt-1 text-gray-900">{selectedRequest.organizationName}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">CIN</h3>
                <p className="mt-1 text-gray-900">{selectedRequest.CIN}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Requested On</h3>
                {/* <p className="mt-1 text-gray-900">{formatDate(selectedRequest.createdAt)}</p> */}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Organization ID</h3>
                <p className="mt-1 text-gray-900">{selectedRequest.orgId}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Owner ID</h3>
                <p className="mt-1 text-gray-900">{selectedRequest.ownerUid}</p>
              </div>
              
              {selectedRequest.status !== 'pending' && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Processed On</h3>
                    {/* <p className="mt-1 text-gray-900">{formatDate(selectedRequest.processedAt)}</p> */}
                  </div>
                  
                  {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Rejection Reason</h3>
                      <p className="mt-1 text-gray-900">{selectedRequest.rejectionReason}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRequests;