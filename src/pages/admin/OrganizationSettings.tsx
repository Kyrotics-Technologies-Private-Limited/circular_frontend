import React, { useState, useEffect } from 'react';
import { updateOrganization } from '../../services/organization.service';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { Building, AlertCircle, CheckCircle, Edit, Calendar, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/ui/loader';

const OrganizationSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentOrganization, loading } = useOrganization();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    name: string;
    CIN: string;
  }>({
    name: '',
    CIN: ''
  });

  useEffect(() => {
    if (currentOrganization) {
      setFormData({
        name: currentOrganization.name || '',
        CIN: currentOrganization.CIN || ''
      });
    }
  }, [currentOrganization]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization?.id) {
      toast.error('Organization ID is missing');
      return;
    }

    try {
      await updateOrganization(currentOrganization.id, formData);
      setEditMode(false);
      toast.success('Organization details updated successfully');

      window.location.reload();
    } catch (error) {
      toast.error('Failed to update organization details');
      console.error('Error updating organization:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader />
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">No organization found</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>You don't seem to be part of an organization.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Organization Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your organization profile and settings
            </p>
          </div>
          {currentOrganization.status === 'pending' && (
            <Badge variant="warning" className="gap-2">
              <AlertCircle size={16} className="h-3.5 w-3.5" />
              Organization pending approval
            </Badge>
          )}
          {currentOrganization.status === 'approved' && (
            <Badge variant="success" className="gap-2">
              <CheckCircle size={16} className="h-3.5 w-3.5" />
              Organization approved
            </Badge>
          )}
          {currentOrganization.status === 'rejected' && (
            <Badge variant="destructive" className="gap-2">
              <AlertCircle size={16} className="h-3.5 w-3.5" />
              Organization rejected
            </Badge>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-5 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Organization Information</h3>
                    {!editMode ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditMode(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditMode(false);
                            setFormData({
                              name: currentOrganization.name || '',
                              CIN: currentOrganization.CIN || ''
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                        Organization Name
                      </label>
                      <Input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </div>

                    <div>
                      <label htmlFor="CIN" className="block text-sm font-medium text-foreground mb-1.5">
                        CIN (Company Identification Number)
                      </label>
                      <Input
                        type="text"
                        name="CIN"
                        id="CIN"
                        value={formData.CIN}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </div>
                  </div>

                  <div className="mt-8 border-t border-border pt-8">
                    <h4 className="text-sm font-medium text-muted-foreground">Additional Details</h4>
                    <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Organization ID</dt>
                        <dd className="mt-1 text-sm text-foreground">{currentOrganization.id || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                        <dd className="mt-1 text-sm text-foreground">
                          <Badge
                            variant={
                              currentOrganization.status === 'approved'
                                ? 'success'
                                : currentOrganization.status === 'pending'
                                ? 'warning'
                                : 'destructive'
                            }
                          >
                            {currentOrganization.status === 'approved'
                              ? 'Approved'
                              : currentOrganization.status === 'pending'
                              ? 'Pending Approval'
                              : 'Rejected'}
                          </Badge>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Owner</dt>
                        <dd className="mt-1 text-sm text-foreground flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            {currentUser?.uid === currentOrganization.ownerUid
                              ? `${currentUser.name} (You)`
                              : currentUser?.name || 'Unknown'}
                          </div>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Created On</dt>
                        <dd className="mt-1 text-sm text-foreground flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          {currentOrganization.createdAt
                            ? new Date(currentOrganization.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Building className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-primary">Organization Status Information</h3>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>
                  {currentOrganization.status === 'pending'
                    ? 'Your organization is currently pending approval from the system administrator. You will be notified once the status changes.'
                    : currentOrganization.status === 'approved'
                    ? 'Your organization is approved. You have full access to all features.'
                    : 'Your organization has been rejected. Please contact support for more information.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettings;
