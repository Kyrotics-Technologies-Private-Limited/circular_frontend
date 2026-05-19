// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useOrganization } from "../contexts/OrganizationContext";
import { getFiles } from "../services/file.service";
import { FileItem } from "../types/File";
// import OrganizationForm from "../components/organizations/OrganizationForm";

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
     currentOrganization,
    userType,
    // setUserType,
    // loading: orgLoading,
  } = useOrganization();
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch recent files for the current user/organization
  useEffect(() => {
    const fetchRecentFiles = async () => {
      try {
        setLoading(true);

        // Fetch files based on user type
        const files = await getFiles(userType === 'organization' ? currentOrganization?.id : undefined);

        // Sort by upload date and take the latest 5
        const sorted = [...files]
          .sort((a, b) => {
            return (
              new Date(b.uploadedAt).getTime() -
              new Date(a.uploadedAt).getTime()
            );
          })
          .slice(0, 5);

        setTotalFiles(files.length);
        setRecentFiles(sorted);
      } catch (err: any) {
        console.error("Error fetching recent files:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentFiles();
  }, [currentOrganization, userType]);

  return (
    <div className="space-y-6">
      {/* Header with user type toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome, {currentUser?.name || "User"} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your files and translations
          </p>
        </div>
        
        {/* <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white p-2 rounded shadow">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={userType === 'individual'}
                onChange={() => handleUserTypeChange('individual')}
              />
              <span className="ml-2 text-sm">Personal</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={userType === 'organization'}
                onChange={() => handleUserTypeChange('organization')}
              />
              <span className="ml-2 text-sm">Organization</span>
            </label>
          </div>
          
      
        </div> */}
      </div>

      {/* Create Organization Section for org users with no orgs */}
       
          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Files Stats Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg transition duration-300 hover:shadow-lg">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Files</h3>
                    <div className="mt-1 text-3xl font-semibold text-gray-900">
                      {loading ? "..." : totalFiles}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {userType === 'organization' && currentOrganization 
                        ? `In ${currentOrganization.name}`
                        : 'In your personal space'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link
                    to="/files"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View all files
                  </Link>
                </div>
              </div>
            </div>

            {/* Translations Stats Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg transition duration-300 hover:shadow-lg">
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
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">
                      Translations
                    </h3>
                    <div className="mt-1 text-3xl font-semibold text-gray-900">
                      {loading
                        ? "..."
                        : recentFiles.filter((f) => f.translatedContent).length}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Completed translations
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link
                    to="/files"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Manage translations
                  </Link>
                </div>
              </div>
            </div>

            {/* Shared Files Stats Card */}
            {/* <div className="bg-white overflow-hidden shadow rounded-lg transition duration-300 hover:shadow-lg">
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
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">
                      Shared Files
                    </h3>
                    <div className="mt-1 text-3xl font-semibold text-gray-900">
                      {loading ? "..." : recentFiles.filter(f => f.isShared).length}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Files shared with you
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link
                    to="/files"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View shared files
                  </Link>
                </div>
              </div>
            </div> */}
          </div>
       

      {/* Quick Actions Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x">
            <Link 
              to="/files" 
              className="p-6 hover:bg-gray-50 flex flex-col items-center justify-center text-center"
            >
              <svg
                className="h-8 w-8 text-indigo-500 mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm font-medium text-gray-900">Upload New File</span>
            </Link>
            
            <Link 
              to="/files" 
              className="p-6 hover:bg-gray-50 flex flex-col items-center justify-center text-center"
            >
              <svg
                className="h-8 w-8 text-indigo-500 mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-900">Create Folder</span>
            </Link>
            
            {userType === 'organization' && (
              <Link 
                to="/files" 
                className="p-6 hover:bg-gray-50 flex flex-col items-center justify-center text-center"
              >
                <svg
                  className="h-8 w-8 text-indigo-500 mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-900">Share Files</span>
              </Link>
            )}
            
            {userType === 'individual' && (
              <Link 
                to="/files" 
                className="p-6 hover:bg-gray-50 flex flex-col items-center justify-center text-center"
              >
                <svg
                  className="h-8 w-8 text-indigo-500 mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-900">View All Files</span>
              </Link>
            )}
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default Dashboard;