// src/components/shared/SharedDirectory.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShare } from "../../contexts/ShareContext";
import { FileItem, Folder } from "../../types/File";
import FileCard from "../files/FileCard";
import { Button } from "../ui/button";
import Loader from "@/components/ui/loader";

const SharedDirectory: React.FC = () => {
  const navigate = useNavigate();
  const {
    sharedFiles,
    sharedFolders,
    loadingShared,
    errorShared,
    refreshSharedItems,
  } = useShare();

  const [showFilesTab, setShowFilesTab] = useState<boolean>(true);

  const handleFolderClick = (folder: Folder) => {
    navigate(`/files?folderId=${folder.id}&shared=true`);
  };

  const handleFileClick = (file: FileItem) => {
    navigate(`/translation/${file.id}`);
  };

  const handleRefresh = async () => {
    await refreshSharedItems();
  };

  const hasFiles = sharedFiles.length > 0;
  const hasFolders = sharedFolders.length > 0;
  const hasNoItems = !hasFiles && !hasFolders;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Shared with Me</h1>

        <Button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          Refresh
        </Button>
      </div>

      {errorShared && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {errorShared}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {(hasFiles || hasFolders) && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setShowFilesTab(true)}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                showFilesTab
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Files ({sharedFiles.length})
            </button>
            <button
              onClick={() => setShowFilesTab(false)}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                !showFilesTab
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Folders ({sharedFolders.length})
            </button>
          </nav>
        </div>
      )}

      {loadingShared ? (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : (
        <div>
          {hasNoItems ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m-6-8h6m-3-4v12"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No shared items
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                When someone shares a file or folder with you, it will appear
                here.
              </p>
            </div>
          ) : showFilesTab ? (
            <>
              {!hasFiles ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No shared files</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sharedFiles.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      isSelected={false}
                      onSelect={() => {}}
                      onClick={() => handleFileClick(file)}
                      isShared={true}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {!hasFolders ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No shared folders</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sharedFolders.map((folder) => (
                    <div
                      key={folder.id}
                      className="relative rounded-lg border border-gray-300 bg-white p-6 shadow-sm hover:shadow cursor-pointer"
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
                          <div className="flex items-center mt-1">
                            <p className="text-xs text-gray-500 mr-2">
                              Shared Folder
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              {folder.permissions && folder.userId
                                ? (
                                    folder.permissions as unknown as Record<
                                      string,
                                      string
                                    >
                                  )[folder.userId] || "view"
                                : "view"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SharedDirectory;
