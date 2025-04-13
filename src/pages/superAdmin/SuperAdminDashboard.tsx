// src/pages/admin/SuperAdminDashboard.tsx
import React, { useState, useEffect } from "react";
// import { getAllOrganizations } from "../../services/organization.service";
// import { useOrganization } from "../../contexts/OrganizationContext";
import { 
  Request, 
  getAllRequests,
  approveRequest,
  rejectRequest
} from "../../services/request.service";

const SuperAdminDashboard: React.FC = () => {
//   const { organizations } = useOrganization();
  // const [totalUsers, setTotalUsers] = useState<number>(0);
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch all requests using the request service
  const fetchAllRequests = async () => {
    try {
      const allRequests = await getAllRequests();
      
      // Filter for pending requests only
      const pending = allRequests.filter(req => req.status === "pending");
      setPendingRequests(pending);
      
      // Sort recent requests by creation date (newest first)
      const recent = [...allRequests]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5); // Only take the 5 most recent
      
      setRecentRequests(recent);
    } catch (err: any) {
      console.error("Error fetching requests:", err);
      setError(err.message || "Failed to load request data");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch organizations
        // const orgs = await getAllOrganizations();
        
        // Calculate total users across all organizations
        // const total = orgs.reduce((acc, org) => {
        //   return acc + (org.members!.length || 0);
        // }, 0);
        // setTotalUsers(total);
        
        // Fetch all requests
        await fetchAllRequests();
        
        setError(null);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle request approval
  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveRequest(requestId);
      await fetchAllRequests(); // Refresh requests after approval
    } catch (err: any) {
      console.error("Error approving request:", err);
      setError(err.message || "Failed to approve request");
    }
  };

  // Handle request rejection
  const handleRejectRequest = async (requestId: string, reason: string = "Request rejected by admin") => {
    try {
      await rejectRequest(requestId, reason);
      await fetchAllRequests(); // Refresh requests after rejection
    } catch (err: any) {
      console.error("Error rejecting request:", err);
      setError(err.message || "Failed to reject request");
    }
  };

  // Helper function to format time
  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of all organizations and system statistics
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Organizations Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Organizations
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {/* {organizations.length} */}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Users Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {/* {totalUsers} */} 0
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Requests
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {pendingRequests.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Requests
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Latest organization registration requests
          </p>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {recentRequests.length > 0 ? (
              recentRequests.map((request) => (
                <li key={request.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      Organization Registration Request
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${request.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : request.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'}`}>
                        {request.status === 'pending' 
                          ? formatTimeAgo(request.createdAt) 
                          : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500 mr-6">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Owner ID: {request.ownerUid}
                      </p>
                      <p className="flex items-center text-sm text-gray-500">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2H4v-1h16v1h-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {request.organizationName}
                      </p>
                    </div>
                    {request.status === 'pending' && (
                      <div className="mt-2 sm:mt-0 sm:flex sm:space-x-2">
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                  {request.CIN && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">CIN: {request.CIN}</p>
                    </div>
                  )}
                </li>
              ))
            ) : (
              <li className="px-4 py-4 sm:px-6">
                <p className="text-sm text-gray-500">No recent requests</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;