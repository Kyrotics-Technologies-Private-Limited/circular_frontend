import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Mail, FileText, Phone, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getOrganizationbyId } from '../services/organization.service';
import { User } from '../types/User';
import { Organization } from '../types/Organization';
import { logoutUser } from '../services/auth.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Loader from '@/components/ui/loader';

const PendingApprovalPage = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [orgData, setOrgData] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);

      if (currentUser) {
        setUserData(currentUser);

        if (currentUser.orgId) {
          try {
            const orgDoc = await getOrganizationbyId(currentUser.orgId);
            if (orgDoc) {
              setOrgData(orgDoc);
            } else {
              console.log("Organization not found");
            }
          } catch (error) {
            console.error("Error fetching organization:", error);
          }
        } else {
          console.log("No orgId available");
        }
      }

      setLoading(false);
    };

    initialize();
  }, [currentUser]);

  useEffect(() => {
    if (!userData?.createdAt) return;

    try {
      const submissionDate = userData.createdAt instanceof Date
        ? userData.createdAt
        : new Date(userData.createdAt);

      const estimatedCompletionDate = new Date(submissionDate);
      estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + 2);

      const updateTimeRemaining = () => {
        const now = new Date();
        const diffTime = estimatedCompletionDate.getTime() - now.getTime();

        if (diffTime <= 0) {
          setTimeRemaining('Review may take longer than expected');
        } else {
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          setTimeRemaining(`~${diffDays}d ${diffHours}h remaining`);
        }
      };

      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 60000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error("Error calculating time remaining:", error);
      setTimeRemaining('Unable to calculate time remaining');
    }
  }, [userData?.createdAt]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@example.com?subject=Organization%20Approval%20Inquiry';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-muted-foreground">Loading your account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Status banner */}
      <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="text-amber-600" size={20} />
          <span className="font-medium text-amber-800">Your organization account is pending for approval</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          Sign Out
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="border-b border-border bg-muted/40 p-6">
            <h1 className="text-2xl font-semibold text-foreground">Organization Verification in Progress</h1>
            <p className="mt-1 text-muted-foreground">
              We're currently reviewing your organization details. This typically takes 1-2 business days.
            </p>
          </div>

          <CardContent className="p-6">
            {/* Progress tracker */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-foreground mb-4">Application Progress</h2>
              <div className="relative">
                <div className="absolute left-0 top-5 w-full h-1 bg-border"></div>
                <div className="absolute left-0 top-5 w-1/3 h-1 bg-primary"></div>
                <div className="relative flex justify-between mb-8">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white z-10">
                      <CheckCircle size={20} />
                    </div>
                    <div className="text-sm font-medium mt-2 text-primary">Submitted</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white z-10">
                      <Clock size={20} />
                    </div>
                    <div className="text-sm font-medium mt-2 text-amber-600">Under Review</div>
                    <div className="text-xs text-muted-foreground mt-1">{timeRemaining}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground z-10">
                      <CheckCircle size={20} />
                    </div>
                    <div className="text-sm font-medium mt-2 text-muted-foreground">Approved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization details */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-foreground mb-4">Organization Details Submitted</h2>
              <div className="bg-muted/40 rounded-xl p-4 border border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Organization Name</p>
                    <p className="font-medium text-foreground">{orgData?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CIN (Company Identification Number)</p>
                    <p className="font-medium text-foreground">{orgData?.CIN || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Contact</p>
                    <p className="font-medium text-foreground">{userData?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Email</p>
                    <p className="font-medium text-foreground">{userData?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-foreground mb-4">What happens next?</h2>
              <div className="space-y-4">
                <div className="flex">
                  <div className="mt-1 mr-4">
                    <AlertCircle size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">We may contact you for verification</h3>
                    <p className="text-muted-foreground text-sm">In some cases, we might need additional information to verify your organization</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="mt-1 mr-4">
                    <Mail size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">You'll receive an email notification</h3>
                    <p className="text-muted-foreground text-sm">Once your organization is approved, we'll send a confirmation to {userData?.email}</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="mt-1 mr-4">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Complete your organization profile</h3>
                    <p className="text-muted-foreground text-sm">After approval, you'll need to complete your profile and invite team members</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Need help? */}
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/15">
              <div className="flex items-start">
                <Phone className="text-primary mt-1 mr-4" size={20} />
                <div>
                  <h3 className="font-medium text-foreground">Need assistance?</h3>
                  <p className="text-muted-foreground mt-1">If you have questions about your application or want to provide additional information:</p>
                  <Button
                    onClick={handleContactSupport}
                    className="mt-3"
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
