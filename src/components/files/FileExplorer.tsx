import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFile } from "../../contexts/FileContext";
import { useOrganization } from "../../contexts/OrganizationContext";
import { FileItem, Folder } from "../../types/File";
import { deleteFile, deleteFolder } from "../../services/file.service";
import FileUpload from "./FileUpload";
import FolderCreate from "./FolderCreate";
import BreadcrumbNav from "./BreadcrumbNav";
import FileCard from "./FileCard";
import { getCurrentUser } from "../../services/auth.service";
import { useAuth } from "../../contexts/AuthContext";

const FileExplorer: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const {
    files,
    folders,
    currentFolder,
    currentPath,
    loading,
    error,
    navigateToFolder,
    navigateUp,
    refreshFiles,
  } = useFile();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: "file" | "folder";
  }>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const {currentUser} = useAuth();

  const handleFolderClick = async (folder: Folder) => {
    try {
      // Add a debounce protection to prevent double navigation
      if (loading) return;
      
      console.log("Navigating to folder:", folder.id);
      await navigateToFolder(folder);
    } catch (error) {
      console.error("Error navigating to folder:", error);
      setActionError("Failed to navigate to folder. Please try again.");
    }
  };

  const handleFileClick = (file: FileItem) => {
    if(currentUser?.role === "admin") {
      navigate(`/admin/translation/${file.id}`);
      return;
    }
    else if(currentUser?.role === "super_admin") {
      navigate(`/super-admin/translation/${file.id}`);
      return;
    }
    else{
      navigate(`/translation/${file.id}`);
      return; 
    }
  };

  const handleBackClick = async () => {
    await navigateUp();
  };

  const toggleItemSelection = (id: string, type: "file" | "folder", event: React.SyntheticEvent) => {
    // Stop propagation to prevent folder navigation when checking the checkbox
    event.stopPropagation();
    
    setSelectedItems((prev) => {
      const updated = { ...prev };
      if (updated[id]) {
        delete updated[id];
      } else {
        updated[id] = type;
      }
      return updated;
    });
  };

  const handleDeleteSelected = async () => {
    try {
      setIsDeleting(true);
      setActionError(null);

      const deletePromises = [];

      for (const [id, type] of Object.entries(selectedItems)) {
        if (type === "file") {
          deletePromises.push(deleteFile(id));
        } else {
          deletePromises.push(deleteFolder(id));
        }
      }

      await Promise.all(deletePromises);
      setSelectedItems({});
      await refreshFiles();
    } catch (err: any) {
      console.error("Error deleting items:", err);
      setActionError(err.message || "Failed to delete selected items");
    } finally {
      setIsDeleting(false);
    }
  };

  const hasSelected = Object.keys(selectedItems).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">File Manager</h1>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Upload File
          </button>
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Folder
          </button>

          {hasSelected && (
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
            >
              {isDeleting ? "Deleting..." : "Delete Selected"}
            </button>
          )}
        </div>
      </div>

      <BreadcrumbNav
        currentPath={currentPath}
        onFolderClick={handleFolderClick}
        onRootClick={() => navigateToFolder(null)}
      />

      {(error || actionError) && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error || actionError}
              </h3>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="spinner">Loading...</div>
        </div>
      ) : (
        <div>
          {folders.length === 0 && files.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {currentFolder
                  ? "This folder is empty."
                  : "No files or folders yet. Upload a file or create a folder to get started."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`relative rounded-lg border border-gray-300 bg-white p-6 shadow-sm hover:shadow cursor-pointer
                    ${
                      selectedItems[folder.id] ? "ring-2 ring-indigo-500" : ""
                    }`}
                  onClick={() => handleFolderClick(folder)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-10 w-10 text-yellow-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {folder.name}
                      </h3>
                      <p className="text-xs text-gray-500">Folder</p>
                    </div>
                    <div className="ml-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={!!selectedItems[folder.id]}
                        onChange={(e) => toggleItemSelection(folder.id, "folder", e)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {files.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  isSelected={!!selectedItems[file.id]}
                  onSelect={() => {
                    // We're creating a version without the event parameter
                    // since FileCard's onSelect doesn't accept parameters
                    toggleItemSelection(file.id, "file", new Event('click') as unknown as React.SyntheticEvent);
                  }}
                  onClick={() => handleFileClick(file)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* File Upload Modal */}
      {showUploadModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white p-6">
                <FileUpload
                  organizationId={currentOrganization?.id || ""}
                  folderId={currentFolder?.id}
                  onSuccess={() => {
                    setShowUploadModal(false);
                    refreshFiles();
                  }}
                  onCancel={() => setShowUploadModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white p-6">
                <FolderCreate
                  organizationId={currentOrganization?.id || ""}
                  parentFolderId={currentFolder?.id}
                  onSuccess={() => {
                    setShowCreateFolderModal(false);
                    refreshFiles();
                  }}
                  onCancel={() => setShowCreateFolderModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;