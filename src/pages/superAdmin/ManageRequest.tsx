// src/components/admin/ManageRequests.tsx
import React, { useState, useEffect } from 'react';
import { Check, X, Eye, AlertTriangle, Clock, Search, Building2, User as UserIcon, FileText } from 'lucide-react';
import { Request, getAllRequests, approveRequest, rejectRequest } from '../../services/request.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import Loader from '@/components/ui/loader';

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

  const filteredRequests = requests.filter(request => {
    if (filter !== 'all' && request.status !== filter) {
      return false;
    }

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

      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, status: 'approved', processedAt: new Date() } : req
        )
      );

      setSuccess('Organization request approved successfully');

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success" className="gap-1.5">
            <Check className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1.5">
            <X className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="warning" className="gap-1.5">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  const selectClass =
    "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  const actionButtonClass =
    "h-8 w-8 p-0 rounded-lg inline-flex items-center justify-center";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Organization Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review and process organization registration requests</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <h3 className="text-sm font-medium text-red-800 ml-2">{error}</h3>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-green-50 p-4">
          <div className="flex items-start">
            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <h3 className="text-sm font-medium text-green-800 ml-2">{success}</h3>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-400 hover:text-green-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex flex-col md:flex-row gap-3">
          <div className="relative md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by organization name or CIN"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-1/4">
            <select
              className={selectClass}
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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No organization requests found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr>
                  {["Organization", "CIN", "Status", "Requested On", "Actions"].map((h, i) => (
                    <th
                      key={h}
                      scope="col"
                      className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                        i === 4 ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="ml-3 font-medium text-foreground">{request.organizationName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {request.CIN}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          onClick={() => openViewModal(request)}
                          variant="outline"
                          className={actionButtonClass}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>

                        {request.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleApprove(request.id)}
                              variant="outline"
                              className={actionButtonClass}
                              title="Approve"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              onClick={() => openRejectModal(request.id)}
                              variant="outline"
                              className={actionButtonClass}
                              title="Reject"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
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
      </div>

      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Organization Request"
        description="Please provide a reason for rejecting this organization registration request."
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              <X className="h-4 w-4 mr-1" />
              Reject Request
            </Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Rejection Reason</label>
          <textarea
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., Invalid CIN, Incomplete information, etc."
          />
        </div>
      </Modal>

      <Modal
        open={showViewModal && !!selectedRequest}
        onClose={() => setShowViewModal(false)}
        title="Organization Request Details"
        description="Full details of the organization registration request"
        footer={
          <Button variant="outline" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Organization Name</h3>
              <p className="mt-1 flex items-center text-foreground">
                <Building2 className="h-4 w-4 mr-1.5 text-muted-foreground" />
                {selectedRequest.organizationName}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">CIN</h3>
              <p className="mt-1 text-foreground">{selectedRequest.CIN}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Requested On</h3>
              <p className="mt-1 flex items-center text-foreground">
                <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                {selectedRequest.createdAt
                  ? new Date(selectedRequest.createdAt).toLocaleString()
                  : '—'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Organization ID</h3>
              <p className="mt-1 text-foreground">{selectedRequest.orgId || '—'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Owner ID</h3>
              <p className="mt-1 flex items-center text-foreground">
                <UserIcon className="h-4 w-4 mr-1.5 text-muted-foreground" />
                {selectedRequest.ownerUid}
              </p>
            </div>

            {selectedRequest.status !== 'pending' && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Processed On</h3>
                  <p className="mt-1 text-foreground">
                    {selectedRequest.processedAt
                      ? new Date(selectedRequest.processedAt).toLocaleString()
                      : '—'}
                  </p>
                </div>

                {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Rejection Reason</h3>
                    <p className="mt-1 flex items-start text-foreground">
                      <FileText className="h-4 w-4 mr-1.5 mt-0.5 text-muted-foreground" />
                      {selectedRequest.rejectionReason}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageRequests;
