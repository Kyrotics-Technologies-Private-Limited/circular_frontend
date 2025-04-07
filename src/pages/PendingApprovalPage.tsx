import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Mail, FileText, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getOrganizationbyId } from '../services/organization.service';
import { User } from '../types/User';
import { Organization } from '../types/Organization';
import { logoutUser } from '../services/auth.service';

const PendingApprovalPage = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [orgData, setOrgData] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const { currentUser } = useAuth(); 

  // Fix 1: Combined useEffect to properly handle data fetching
  useEffect(() => {
    const initialize = async () => {
      // Set loading state
      setLoading(true);
      
      // Set user data from currentUser
      if (currentUser) {
        setUserData(currentUser);
        
        // Fetch organization data if orgId exists
        if (currentUser.orgId) {
          try {
            const orgDoc = await getOrganizationbyId(currentUser.orgId);
            if (orgDoc) {
              // console.log("Organization fetched successfully:", orgDoc.name);
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
      
      // Set loading to false after all data is fetched
      setLoading(false);
    };

    initialize();
  }, [currentUser]); // Only re-run if currentUser changes

  // Fix 2: Separated the time calculation into its own effect
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

  // Fix 3: Updated logout to use actual auth logout functionality
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your account information...</p>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status banner */}
      <div className="bg-yellow-50 border-b border-yellow-100 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="text-yellow-500" size={20} />
          <span className="font-medium text-yellow-700">Your organization account is pending approval</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          Sign Out
        </button>
      </div>

      {/* Rest of your component JSX... */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 bg-gray-50 p-6">
            <h1 className="text-2xl font-semibold text-gray-800">Organization Verification in Progress</h1>
            <p className="mt-1 text-gray-600">
              We're currently reviewing your organization details. This typically takes 1-2 business days.
            </p>
          </div>

          {/* Main content */}
          <div className="p-6">
            {/* Progress tracker */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-700 mb-4">Application Progress</h2>
              <div className="relative">
                <div className="absolute left-0 top-5 w-full h-1 bg-gray-200"></div>
                <div className="absolute left-0 top-5 w-1/3 h-1 bg-blue-500"></div>
                <div className="relative flex justify-between mb-8">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white z-10">
                      <CheckCircle size={20} />
                    </div>
                    <div className="text-sm font-medium mt-2 text-blue-600">Submitted</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-white z-10">
                      <Clock size={20} />
                    </div>
                    <div className="text-sm font-medium mt-2 text-yellow-600">Under Review</div>
                    <div className="text-xs text-gray-500 mt-1">{timeRemaining}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 z-10">
                      <CheckCircle size={20} />
                    </div>
                    <div className="text-sm font-medium mt-2 text-gray-400">Approved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization details */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-700 mb-4">Organization Details Submitted</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Organization Name</p>
                    <p className="font-medium">{orgData?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CIN (Company Identification Number)</p>
                    <p className="font-medium">{orgData?.CIN || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Primary Contact</p>
                    <p className="font-medium">{userData?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Email</p>
                    <p className="font-medium">{userData?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-700 mb-4">What happens next?</h2>
              <div className="space-y-4">
                <div className="flex">
                  <div className="mt-1 mr-4">
                    <Mail size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">You'll receive an email notification</h3>
                    <p className="text-gray-600 text-sm">Once your organization is approved, we'll send a confirmation to {userData?.email}</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="mt-1 mr-4">
                    <FileText size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Complete your organization profile</h3>
                    <p className="text-gray-600 text-sm">After approval, you'll need to complete your profile and invite team members</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="mt-1 mr-4">
                    <AlertCircle size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">We may contact you for verification</h3>
                    <p className="text-gray-600 text-sm">In some cases, we might need additional information to verify your organization</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Need help? */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="flex items-start">
                <Phone className="text-blue-500 mt-1 mr-4" size={20} />
                <div>
                  <h3 className="font-medium text-gray-800">Need help with your application?</h3>
                  <p className="text-gray-600 mt-1">If you have questions about your application or want to provide additional information:</p>
                  <button
                    onClick={handleContactSupport}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;