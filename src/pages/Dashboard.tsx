// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useOrganization } from "../contexts/OrganizationContext";
import { getFiles } from "../services/file.service";
import { FileItem } from "../types/File";
import OrganizationForm from "../components/organizations/OrganizationForm";

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    organizations,
    currentOrganization,
    userType,
    setUserType,
    loading: orgLoading,
  } = useOrganization();
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch recent files for the current user/organization
  useEffect(() => {
    const fetchRecentFiles = async () => {
      try {
        setLoading(true);
        setError(null);

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
        setError(err.message || "Failed to load recent files");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentFiles();
  }, [currentOrganization, userType]);

  const handleUserTypeChange = (type: 'individual' | 'organization') => {
    setUserType(type);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header with user type toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome, {currentUser?.displayName || "User"}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your files and translations
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
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
          
          {userType === 'organization' && organizations.length > 0 && (
            <select
              className="pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              value={currentOrganization?.id || ''}
              onChange={(e) => {
                const selectedOrg = organizations.find(org => org.id === e.target.value);
                if (selectedOrg) {
                  const { setCurrentOrganization } = useOrganization();
                  setCurrentOrganization(selectedOrg);
                }
              }}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Create Organization Section for org users with no orgs */}
      {userType === 'organization' && organizations.length === 0 && !orgLoading ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Get Started with Organizations
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Create your first organization to start managing files and translations with team members.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <OrganizationForm />
            </div>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}

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
                to="/share" 
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

      {/* Recent Files Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Files
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your most recently uploaded files
            </p>
          </div>
          <Link
            to="/files"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Upload New File
          </Link>
        </div>

        {error && (
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200">
          {loading ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <div className="spinner">Loading...</div>
            </div>
          ) : recentFiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Size
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Upload Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {file.type.includes('pdf') ? (
                              <svg
                                className="h-6 w-6 text-red-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                            ) : file.type.includes('word') ? (
                              <svg
                                className="h-6 w-6 text-blue-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-6 w-6 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {file.name}
                            </div>
                            {/* {file.isShared && (
                              <div className="text-xs text-gray-500">
                                Shared with you
                              </div>
                            )} */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {file.translatedContent ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Translated
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Not Translated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link
                            to={`/translation/${file.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {file.translatedContent ? "Edit" : "Translate"}
                          </Link>
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            View
                          </a>
                          {!file.isShared && (
                            <button
                              onClick={() => {
                                /* Share file functionality will go here */
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Share
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">No files uploaded yet.</p>
              <Link
                to="/files"
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Upload Your First File
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;