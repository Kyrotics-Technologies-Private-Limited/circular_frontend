import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, FileText, Building, User, Mail, Phone, Calendar, Clock, Info } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

interface SignupRequest {
  id: string;
  organizationName: string;
  industry: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  employees: number;
  description: string;
  documents: {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
  }[];
  notes: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  statusUpdateDate?: string;
  statusUpdateBy?: string;
}

const SignupRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<SignupRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNote, setAdminNote] = useState('');
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  // Fetch request data - would be replaced with actual API call
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      // Mock data for a single request
      const mockRequest: SignupRequest = {
        id: id || '1',
        organizationName: 'Acme Corporation',
        industry: 'Manufacturing',
        address: '123 Main St, Suite 400, Anytown, USA 12345',
        contactPerson: 'John Doe',
        email: 'john@acme.com',
        phone: '(555) 123-4567',
        employees: 240,
        description: 'Acme Corporation is a leading manufacturer of innovative products for various industries. We specialize in creating high-quality solutions for our clients worldwide. Our company has been in operation for over 20 years with offices in multiple countries.',
        documents: [
          {
            id: 'd1',
            name: 'Business_License.pdf',
            type: 'application/pdf',
            uploadDate: '2025-03-15T09:35:00'
          },
          {
            id: 'd2',
            name: 'Tax_Certificate.pdf',
            type: 'application/pdf',
            uploadDate: '2025-03-15T09:36:00'
          },
          {
            id: 'd3',
            name: 'Organization_Structure.docx',
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            uploadDate: '2025-03-15T09:37:00'
          }
        ],
        notes: 'Requesting access for our entire team to utilize the platform for project management and collaboration.',
        requestDate: '2025-03-15T09:30:00',
        status: 'pending'
      };
      
      setRequest(mockRequest);
      setIsLoading(false);
    }, 800);
  }, [id]);

  const handleApprove = () => {
    // In a real app, this would be an API call
    if (request) {
      const updatedRequest = {
        ...request,
        status: 'approved' as const,
        statusUpdateDate: new Date().toISOString(),
        statusUpdateBy: 'Admin User'
      };
      setRequest(updatedRequest);
      setShowApproveConfirm(false);
    }
  };

  const handleReject = () => {
    // In a real app, this would be an API call
    if (request) {
      const updatedRequest = {
        ...request,
        status: 'rejected' as const,
        statusUpdateDate: new Date().toISOString(),
        statusUpdateBy: 'Admin User'
      };
      setRequest(updatedRequest);
      setShowRejectConfirm(false);
    }
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

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <div className="bg-red-100 text-red-600 p-2 rounded"><FileText className="h-5 w-5" /></div>;
    } else if (type.includes('word') || type.includes('document')) {
      return <div className="bg-blue-100 text-blue-600 p-2 rounded"><FileText className="h-5 w-5" /></div>;
    } else if (type.includes('image')) {
      return <div className="bg-green-100 text-green-600 p-2 rounded"><FileText className="h-5 w-5" /></div>;
    } else {
      return <div className="bg-gray-100 text-gray-600 p-2 rounded"><FileText className="h-5 w-5" /></div>;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Request Not Found</h1>
        </div>
        <p className="text-gray-600">The requested signup request could not be found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Signup Request: {request.organizationName}
          </h1>
        </div>
        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>

      {/* Status update info, if available */}
      {request.statusUpdateDate && (
        <div className="bg-gray-50 p-4 rounded-md mb-6 flex items-start">
          <Info className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
          <div>
            <p className="text-gray-700">
              <span className="font-medium">Status updated: </span> 
              {formatDate(request.statusUpdateDate)}
              {request.statusUpdateBy && <span> by {request.statusUpdateBy}</span>}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <Building className="h-5 w-5 mr-2 text-gray-500" />
                Organization Information
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Organization Name</h3>
                  <p className="mt-1 text-gray-900">{request.organizationName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Industry</h3>
                  <p className="mt-1 text-gray-900">{request.industry}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Number of Employees</h3>
                  <p className="mt-1 text-gray-900">{request.employees}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="mt-1 text-gray-900">{request.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                Contact Information
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
                  <p className="mt-1 text-gray-900">{request.contactPerson}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-gray-900">
                    <a href={`mailto:${request.email}`} className="text-blue-600 hover:text-blue-800">
                      {request.email}
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="mt-1 text-gray-900">{request.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                Organization Description
              </h2>
            </div>
            <div className="p-4">
              <p className="text-gray-900 whitespace-pre-line">{request.description}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <Info className="h-5 w-5 mr-2 text-gray-500" />
                Additional Notes
              </h2>
            </div>
            <div className="p-4">
              <p className="text-gray-900 whitespace-pre-line">{request.notes}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          {request.status === 'pending' && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">Actions</h2>
              </div>
              <div className="p-4 space-y-4">
                <button
                  onClick={() => setShowApproveConfirm(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Approve Request
                </button>
                <button
                  onClick={() => setShowRejectConfirm(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
                >
                  <X className="h-5 w-5 mr-2" />
                  Reject Request
                </button>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Admin Notes</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes about this request..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Request Info Card */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Request Information</h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  Request Date
                </h3>
                <p className="mt-1 text-gray-900">{formatDate(request.requestDate)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  Request ID
                </h3>
                <p className="mt-1 text-gray-900">{request.id}</p>
              </div>
            </div>
          </div>

          {/* Documents Card */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Uploaded Documents</h2>
            </div>
            <div className="p-4">
              {request.documents.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {request.documents.map((doc) => (
                    <li key={doc.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        {getFileIcon(doc.type)}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(doc.uploadDate)}</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Download
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No documents uploaded</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Confirm Approval</h2>
              <p className="text-gray-600 mt-2">
                Are you sure you want to approve the signup request for <span className="font-medium">{request.organizationName}</span>?
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowApproveConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Confirm Rejection</h2>
              <p className="text-gray-600 mt-2">
                Are you sure you want to reject the signup request for <span className="font-medium">{request.organizationName}</span>?
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowRejectConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupRequestDetails;