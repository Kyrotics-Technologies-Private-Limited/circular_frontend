// src/components/shared/SharedDirectory.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShare } from "../../contexts/ShareContext";
import { FileItem, Folder as FolderType } from "../../types/File";
import FileCard from "../files/FileCard";
import { Button } from "../ui/button";
import Loader from "@/components/ui/loader";
import { Badge } from "../ui/badge";
import { RefreshCw, Folder as FolderIcon, Share2, AlertCircle, Inbox } from "lucide-react";

/** Format an ISO date or Date into a readable string like "May 19, 2026" */
const formatDate = (value: string | Date | undefined | null): string => {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

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

  const handleFolderClick = (folder: FolderType) => {
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

  const tabClass = (active: boolean) =>
    `py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
      active
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Shared with Me</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Files and folders others have shared with you
          </p>
        </div>

        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {errorShared && (
        <div className="rounded-xl bg-red-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <h3 className="text-sm font-medium text-red-800 ml-2">
              {errorShared}
            </h3>
          </div>
        </div>
      )}

      {/* Tabs */}
      {(hasFiles || hasFolders) && (
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setShowFilesTab(true)}
              className={tabClass(showFilesTab)}
            >
              Files ({sharedFiles.length})
            </button>
            <button
              onClick={() => setShowFilesTab(false)}
              className={tabClass(!showFilesTab)}
            >
              Folders ({sharedFolders.length})
            </button>
          </nav>
        </div>
      )}

      {loadingShared ? (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      ) : (
        <div>
          {hasNoItems ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border bg-muted/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Inbox className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-foreground">
                No shared items
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                When someone shares a file or folder with you, it will appear
                here.
              </p>
            </div>
          ) : showFilesTab ? (
            <>
              {!hasFiles ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No shared files</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No shared folders</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sharedFolders.map((folder) => {
                    const permission =
                      folder.permissions &&
                      folder.userId &&
                      (folder.permissions as unknown as Record<string, string>)[
                        folder.userId
                      ];
                    return (
                      <div
                        key={folder.id}
                        className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                        onClick={() => handleFolderClick(folder)}
                      >
                        <div className="flex items-start">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 flex-shrink-0">
                            <FolderIcon className="h-6 w-6" strokeWidth={1.75} />
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-foreground truncate" title={folder.name}>
                              {folder.name}
                            </h3>

                            <div className="flex flex-col text-[11px] text-muted-foreground mt-1">
                              <div className="flex items-center max-w-full">
                                <Share2 className="h-3 w-3 mr-1 text-primary flex-shrink-0" />
                                <span className="truncate font-medium text-primary" title={folder.sharedByName || ""}>
                                  {folder.sharedByName ? folder.sharedByName : "Shared Folder"}
                                </span>
                              </div>
                              {folder.sharedAt && (
                                <span className="text-muted-foreground mt-0.5 ml-4">
                                  {formatDate(folder.sharedAt)}
                                </span>
                              )}
                            </div>

                            <div className="mt-2 flex items-center">
                              <Badge variant={permission === "edit" ? "success" : "secondary"} size="sm">
                                {permission ? permission : "view"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
