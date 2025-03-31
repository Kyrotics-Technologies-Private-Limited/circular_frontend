// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getFiles } from "../../services/file.service";
import { useOrganization } from "../../contexts/OrganizationContext";
import { FileItem } from "../../types/File";
import { getOrganizationUsers } from "../../services/organization.service";
import { Link } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const { currentOrganization, loading: orgLoading } = useOrganization();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<FileItem[]>([]);
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [totalTranslations, setTotalTranslations] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentOrganization) return;
      try {
        setLoading(true);

        // Fetch files and set recent files (for regular admins)

        const files = await getFiles(currentOrganization.id);
        console.log("files", files);

        // Sort by upload date and take the latest 5
        const sorted = [...files]
          .sort((a, b) => {
            return (
              new Date(b.uploadedAt).getTime() -
              new Date(a.uploadedAt).getTime()
            );
          })
          .slice(0, 5);

        setRecentFiles(sorted);
        setTotalFiles(files);
        setTotalTranslations(files.filter((f) => f.translatedContent).length);

        const users = await getOrganizationUsers(currentOrganization.id);
        setTotalUsers(users.length);

        setError(null);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentOrganization]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  // Helper function to format time
  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isSuperAdmin ? "Super Admin Dashboard" : "Admin Dashboard"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isSuperAdmin
            ? "Overview of all organizations and system statistics"
            : "Overview of your organization and statistics"}
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Organizations Card - Super Admin Only */}
        {isSuperAdmin && (
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
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

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
                      {totalUsers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests Card - Super Admin Only */}
        {isSuperAdmin && (
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
              </div>
            </div>
          </div>
        )}

        {/* Files Card - Regular Admin Only */}
        {!isSuperAdmin && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
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
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Files
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {loading ? "..." : totalFiles.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Translations Card - Regular Admin Only */}
        {!isSuperAdmin && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-pink-500 rounded-md p-3">
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
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Translations
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {loading ? "..." : totalTranslations}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      {/* <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {isSuperAdmin ? "Recent Requests" : "Recent Activity"}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {isSuperAdmin
              ? "Latest requests requiring your attention"
              : "Latest actions and events in the system"}
          </p>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {!isSuperAdmin && (
              <>
                <li className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      New user registered
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        2 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
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
                        John Smith
                      </p>
                    </div>
                  </div>
                </li>
                <li className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      File translated
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        10 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        business_proposal.docx
                      </p>
                    </div>
                  </div>
                </li>
                <li className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      New organization created
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        1 hour ago
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
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
                        Acme Corporation
                      </p>
                    </div>
                  </div>
                </li>
              </>
            )}
          </ul>
        </div>
      </div> */}
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

export default AdminDashboard;
