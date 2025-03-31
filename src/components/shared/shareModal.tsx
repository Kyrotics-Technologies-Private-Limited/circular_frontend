// src/components/shared/ShareModal.tsx
import React, { useState, useEffect } from "react";
import { 
  getUsersForSharing, 
  shareFileWithUsers, 
  shareFolderWithUsers,
  getFileAccessList,
  getFolderAccessList,
  updateFilePermission,
  updateFolderPermission,
  removeFileAccess,
  removeFolderAccess,
  generateSharingLink,
  makeFilePublic,
  makeFolderPublic,
  UserForSharing,
  AccessList
} from "../../services/share.service";
import { useOrganization } from "../../contexts/OrganizationContext";
import { FileItem, Folder } from "../../types/File";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "file" | "folder";
  item: FileItem | Folder;
  organizationId?: string;
  onSuccess: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  type,
  item,
  organizationId,
  onSuccess
}) => {
  const { currentOrganization } = useOrganization();
  
  const [activeTab, setActiveTab] = useState<"share" | "manage" | "link">("share");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserForSharing[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [permission, setPermission] = useState<"view" | "edit">("view");
  const [includeContents, setIncludeContents] = useState(true);
  const [accessList, setAccessList] = useState<AccessList | null>(null);
  
  // Link generation states
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [linkExpiration, setLinkExpiration] = useState<number | null>(24); // Default 24 hours
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Public sharing states
  const [isPublic, setIsPublic] = useState(false);
  
  // Load users for sharing
  useEffect(() => {
    if (isOpen && activeTab === "share") {
      fetchUsers();
    }
  }, [isOpen, activeTab, currentOrganization]);
  
  // Load access list
  useEffect(() => {
    if (isOpen && activeTab === "manage") {
      fetchAccessList();
    }
  }, [isOpen, activeTab]);
  
  // Check if item is already public
  useEffect(() => {
    if (isOpen && item) {
      setIsPublic(!!item.isPublic);
    }     
  }, [isOpen, item]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsersForSharing(currentOrganization?.id);
      if (response.success) {
        setUsers(response.users || []);
      } else {
        setError(response.message || "Failed to load users");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAccessList = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = type === "file"
        ? await getFileAccessList(item.id)
        : await getFolderAccessList(item.id);
        
      if (response.success) {
        setAccessList(response);
      } else {
        setError(response.message || "Failed to load access list");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user to share with");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = type === "file"
        ? await shareFileWithUsers(item.id, selectedUsers, permission)
        : await shareFolderWithUsers(item.id, selectedUsers, permission, includeContents);
        
      if (response.success) {
        setSelectedUsers([]);
        onSuccess();
        setActiveTab("manage"); // Switch to manage tab after sharing
        fetchAccessList(); // Refresh the access list
      } else {
        setError(response.message || "Failed to share");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdatePermission = async (userId: string, newPermission: "view" | "edit") => {
    try {
      setLoading(true);
      setError(null);
      
      const response = type === "file"
        ? await updateFilePermission(item.id, userId, newPermission)
        : await updateFolderPermission(item.id, userId, newPermission, includeContents);
        
      if (response.success) {
        fetchAccessList(); // Refresh the access list
      } else {
        setError(response.message || "Failed to update permission");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveAccess = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = type === "file"
        ? await removeFileAccess(item.id, userId)
        : await removeFolderAccess(item.id, userId, includeContents);
        
      if (response.success) {
        fetchAccessList(); // Refresh the access list
      } else {
        setError(response.message || "Failed to remove access");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await generateSharingLink(type, item.id, linkExpiration || undefined);
        
      if (response.success) {
        setGeneratedLink(response.url);
      } else {
        setError(response.message || "Failed to generate link");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };
  
  const handleTogglePublic = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const newPublicState = !isPublic;
      const orgId = organizationId || currentOrganization?.id;
      
      if (newPublicState && !orgId) {
        setError("Organization ID is required to make an item public");
        setLoading(false);
        return;
      }
      
      const response = type === "file"
        ? await makeFilePublic(item.id, newPublicState, orgId)
        : await makeFolderPublic(item.id, newPublicState, orgId, includeContents);
        
      if (response.success) {
        setIsPublic(newPublicState);
        onSuccess();
      } else {
        setError(response.message || `Failed to make ${type} ${newPublicState ? 'public' : 'private'}`);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {type === "file" ? "Share File" : "Share Folder"}: {item.name}
                </h3>
                
                {/* Tab Navigation */}
                <div className="mt-4 border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab("share")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "share"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Share with People
                    </button>
                    <button
                      onClick={() => setActiveTab("manage")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "manage"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Manage Access
                    </button>
                    <button
                      onClick={() => setActiveTab("link")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "link"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Get Link
                    </button>
                  </nav>
                </div>
                
                {/* Error Message */}
                {error && (
                  <div className="mt-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Share with People Tab */}
                {activeTab === "share" && (
                  <div className="mt-4">
                    <div className="mb-4">
                      <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                        Search People
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          name="search"
                          id="search"
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                          placeholder="Search by name or email"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                      {loading ? (
                        <div className="flex justify-center items-center h-32">
                          <div className="spinner">Loading...</div>
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="p-4 text-gray-500 text-center">
                          {searchTerm ? "No users match your search" : "No users available"}
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {filteredUsers.map((user) => (
                            <li key={user.id} className="px-4 py-3 hover:bg-gray-50">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(user.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedUsers([...selectedUsers, user.id]);
                                    } else {
                                      setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                    }
                                  }}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <div className="ml-3 flex-1">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                                {user.organizationMember && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Organization Member
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Permission level
                      </label>
                      <div className="flex space-x-4">
                        <div className="flex items-center">
                          <input
                            id="view"
                            name="permission"
                            type="radio"
                            value="view"
                            checked={permission === "view"}
                            onChange={() => setPermission("view")}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <label htmlFor="view" className="ml-2 block text-sm text-gray-700">
                            View only
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="edit"
                            name="permission"
                            type="radio"
                            value="edit"
                            checked={permission === "edit"}
                            onChange={() => setPermission("edit")}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <label htmlFor="edit" className="ml-2 block text-sm text-gray-700">
                            Edit
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {type === "folder" && (
                      <div className="mt-4">
                        <div className="flex items-center">
                          <input
                            id="include-contents"
                            name="include-contents"
                            type="checkbox"
                            checked={includeContents}
                            onChange={(e) => setIncludeContents(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="include-contents" className="ml-2 block text-sm text-gray-700">
                            Apply to all contents within this folder
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {/* Organization Public Sharing */}
                    {currentOrganization && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Make public within organization</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Anyone in {currentOrganization.name} can access this {type}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              type="button"
                              onClick={handleTogglePublic}
                              disabled={loading}
                              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                isPublic ? "bg-indigo-600" : "bg-gray-200"
                              }`}
                            >
                              <span className="sr-only">Make public</span>
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                  isPublic ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Manage Access Tab */}
                {activeTab === "manage" && (
                  <div className="mt-4">
                    {loading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="spinner">Loading...</div>
                      </div>
                    ) : !accessList ? (
                      <div className="p-4 text-gray-500 text-center">
                        Failed to load access information
                      </div>
                    ) : (
                      <div>
                        {/* Owner */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Owner</h4>
                          <div className="flex items-center p-3 bg-gray-50 rounded-md">
                            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                              {accessList.owner.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="text-sm font-medium text-gray-900">{accessList.owner.name}</div>
                              <div className="text-xs text-gray-500">{accessList.owner.email}</div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Owner
                            </span>
                          </div>
                        </div>
                        
                        {/* Shared With */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            People with access ({accessList.sharedWith.length})
                          </h4>
                          
                          {accessList.sharedWith.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                              This {type} hasn't been shared with anyone
                            </p>
                          ) : (
                            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                              {accessList.sharedWith.map((user) => (
                                <li key={user.id} className="px-4 py-3 flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                      {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                      <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <select
                                      value={user.permission}
                                      onChange={(e) => handleUpdatePermission(user.id, e.target.value as "view" | "edit")}
                                      disabled={loading}
                                      className="block text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                      <option value="view">View</option>
                                      <option value="edit">Edit</option>
                                    </select>
                                    
                                    <button
                                      onClick={() => handleRemoveAccess(user.id)}
                                      disabled={loading}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        
                        {/* Public Status */}
                        <div className="mt-6 flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {isPublic ? "Public within organization" : "Not public"}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {isPublic
                                ? `Anyone in your organization can access this ${type}`
                                : `This ${type} is only accessible to people listed above`}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              type="button"
                              onClick={handleTogglePublic}
                              disabled={loading}
                              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                isPublic ? "bg-indigo-600" : "bg-gray-200"
                              }`}
                            >
                              <span className="sr-only">Toggle public</span>
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                  isPublic ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Get Link Tab */}
                {activeTab === "link" && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Create a link that you can share with anyone to allow them to access this {type}.
                    </p>
                    
                    <div className="mb-4">
                      <label htmlFor="expiration" className="block text-sm font-medium text-gray-700">
                        Link Expiration (hours)
                      </label>
                      <select
                        id="expiration"
                        value={linkExpiration?.toString() || ""}
                        onChange={(e) => setLinkExpiration(e.target.value ? parseInt(e.target.value) : null)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">Never expire</option>
                        <option value="24">24 hours</option>
                        <option value="72">3 days</option>
                        <option value="168">1 week</option>
                        <option value="720">30 days</option>
                      </select>
                    </div>
                    
                    {!generatedLink ? (
                      <button
                        type="button"
                        onClick={handleGenerateLink}
                        disabled={loading}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                      >
                        {loading ? "Generating..." : "Generate Link"}
                      </button>
                    ) : (
                      <div>
                        <div className="flex mt-2">
                          <input
                            type="text"
                            readOnly
                            value={generatedLink}
                            className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            {linkCopied ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          {linkExpiration
                            ? `This link will expire in ${linkExpiration} hours.`
                            : "This link will never expire."}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {activeTab === "share" && (
              <button
                type="button"
                onClick={handleShare}
                disabled={loading || selectedUsers.length === 0}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {loading ? "Sharing..." : "Share"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              {activeTab === "manage" || activeTab === "link" ? "Close" : "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;