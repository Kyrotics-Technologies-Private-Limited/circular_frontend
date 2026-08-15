import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, FileText, Building, User as UserIcon, Calendar, Clock, Info } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import Loader from '@/components/ui/loader';

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

  useEffect(() => {
    setTimeout(() => {
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
      return <div className="bg-red-100 text-red-600 p-2 rounded-lg"><FileText className="h-4 w-4" /></div>;
    } else if (type.includes('word') || type.includes('document')) {
      return <div className="bg-primary/10 text-primary p-2 rounded-lg"><FileText className="h-4 w-4" /></div>;
    } else if (type.includes('image')) {
      return <div className="bg-green-100 text-green-600 p-2 rounded-lg"><FileText className="h-4 w-4" /></div>;
    } else {
      return <div className="bg-muted text-muted-foreground p-2 rounded-lg"><FileText className="h-4 w-4" /></div>;
    }
  };

  const statusVariant = (status: string): BadgeProps["variant"] => {
    if (status === 'pending') return 'warning';
    if (status === 'approved') return 'success';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Request Not Found</h1>
        </div>
        <p className="text-muted-foreground">The requested signup request could not be found.</p>
      </div>
    );
  }

  const sectionCard =
    "rounded-2xl border border-border bg-card overflow-hidden";
  const sectionHeader =
    "px-5 py-4 border-b border-border flex items-center";
  const sectionTitle = "text-lg font-semibold text-foreground flex items-center";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-3 h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            Signup Request: {request.organizationName}
          </h1>
        </div>
        <Badge variant={statusVariant(request.status)} size="lg">
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </Badge>
      </div>

      {request.statusUpdateDate && (
        <div className="rounded-xl bg-muted/40 p-4 flex items-start">
          <Info className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-foreground">
              <span className="font-medium">Status updated: </span>
              {formatDate(request.statusUpdateDate)}
              {request.statusUpdateBy && <span> by {request.statusUpdateBy}</span>}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className={sectionCard}>
            <div className={sectionHeader}>
              <h2 className={sectionTitle}>
                <Building className="h-5 w-5 mr-2 text-primary" />
                Organization Information
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Organization Name</h3>
                  <p className="mt-1 text-foreground">{request.organizationName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Industry</h3>
                  <p className="mt-1 text-foreground">{request.industry}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Number of Employees</h3>
                  <p className="mt-1 text-foreground">{request.employees}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                  <p className="mt-1 text-foreground">{request.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={sectionCard}>
            <div className={sectionHeader}>
              <h2 className={sectionTitle}>
                <UserIcon className="h-5 w-5 mr-2 text-primary" />
                Contact Information
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Contact Person</h3>
                  <p className="mt-1 text-foreground">{request.contactPerson}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="mt-1 text-foreground">
                    <a href={`mailto:${request.email}`} className="text-primary hover:underline">
                      {request.email}
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                  <p className="mt-1 text-foreground">{request.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={sectionCard}>
            <div className={sectionHeader}>
              <h2 className={sectionTitle}>
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Organization Description
              </h2>
            </div>
            <div className="p-5">
              <p className="text-foreground whitespace-pre-line">{request.description}</p>
            </div>
          </div>

          <div className={sectionCard}>
            <div className={sectionHeader}>
              <h2 className={sectionTitle}>
                <Info className="h-5 w-5 mr-2 text-primary" />
                Additional Notes
              </h2>
            </div>
            <div className="p-5">
              <p className="text-foreground whitespace-pre-line">{request.notes}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {request.status === 'pending' && (
            <div className={sectionCard}>
              <div className={sectionHeader}>
                <h2 className={sectionTitle}>Actions</h2>
              </div>
              <div className="p-5 space-y-4">
                <Button
                  onClick={() => setShowApproveConfirm(true)}
                  className="w-full"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Request
                </Button>
                <Button
                  onClick={() => setShowRejectConfirm(true)}
                  variant="destructive"
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Request
                </Button>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Admin Notes</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Add notes about this request..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          <div className={sectionCard}>
            <div className={sectionHeader}>
              <h2 className={sectionTitle}>Request Information</h2>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  Request Date
                </h3>
                <p className="mt-1 text-foreground">{formatDate(request.requestDate)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  Request ID
                </h3>
                <p className="mt-1 text-foreground">{request.id}</p>
              </div>
            </div>
          </div>

          <div className={sectionCard}>
            <div className={sectionHeader}>
              <h2 className={sectionTitle}>Uploaded Documents</h2>
            </div>
            <div className="p-5">
              {request.documents.length > 0 ? (
                <ul className="divide-y divide-border">
                  {request.documents.map((doc) => (
                    <li key={doc.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        {getFileIcon(doc.type)}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(doc.uploadDate)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="text-primary hover:text-primary/80 text-sm font-medium h-8">
                        Download
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No documents uploaded</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        title="Confirm Approval"
        description={`Are you sure you want to approve the signup request for ${request.organizationName}?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowApproveConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          The organization will gain access to the platform immediately.
        </p>
      </Modal>

      <Modal
        open={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        title="Confirm Rejection"
        description={`Are you sure you want to reject the signup request for ${request.organizationName}?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRejectConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          The organization will be notified of the rejection.
        </p>
      </Modal>
    </div>
  );
};

export default SignupRequestDetails;
