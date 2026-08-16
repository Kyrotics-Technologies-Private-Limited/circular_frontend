import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFile } from "../../contexts/FileContext";
import { useOrganization } from "../../contexts/OrganizationContext";
import { FileItem, Folder as FolderType } from "../../types/File";
import { deleteFile, deleteFolder } from "../../services/file.service";
import FileUpload from "./FileUpload";
import FolderCreate from "./FolderCreate";
import BreadcrumbNav from "./BreadcrumbNav";
import FileCard from "./FileCard";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/loader";
import { Modal } from "../ui/modal";
import {
  Upload,
  FolderPlus,
  Trash2,
  Folder as FolderIcon,
  AlertCircle,
  FolderSearch,
} from "lucide-react";

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
    refreshFiles,
  } = useFile();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: "file" | "folder";
  }>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentUser } = useAuth();

  const handleFolderClick = async (folder: FolderType) => {
    try {
      if (loading) return;
      await navigateToFolder(folder);
    } catch (error) {
      console.error("Error navigating to folder:", error);
      setActionError("Failed to navigate to folder. Please try again.");
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (currentUser?.role === "admin" || currentUser?.role === "super_admin") {
      navigate(`/admin/translation/${file.id}`);
      return;
    } else {
      navigate(`/translation/${file.id}`);
      return;
    }
  };

  const toggleItemSelection = (
    id: string,
    type: "file" | "folder",
    event: React.SyntheticEvent
  ) => {
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
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">File Manager</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {currentFolder
              ? `Inside "${currentFolder.name}"`
              : "Your documents and folders"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {hasSelected && (
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : `Delete (${Object.keys(selectedItems).length})`}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowCreateFolderModal(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      </div>

      <BreadcrumbNav
        currentPath={currentPath}
        onFolderClick={handleFolderClick}
        onRootClick={() => navigateToFolder(null)}
      />

      {(error || actionError) && (
        <div className="rounded-xl bg-red-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <h3 className="text-sm font-medium text-red-800 ml-2">
              {error || actionError}
            </h3>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      ) : (
        <div>
          {folders.length === 0 && files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border bg-muted/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FolderSearch className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-foreground">
                {currentFolder ? "This folder is empty" : "No files or folders yet"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                {currentFolder
                  ? "Upload a file or create a sub-folder to get started."
                  : "Upload a file or create a folder to get started."}
              </p>
              <div className="mt-5 flex gap-2.5">
                <Button onClick={() => setShowUploadModal(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <Button variant="outline" onClick={() => setShowCreateFolderModal(true)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {folders.map((folder) => {
                const isSelected = !!selectedItems[folder.id];
                return (
                  <div
                    key={folder.id}
                    className={`group relative rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/30"
                    }`}
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
                        <p className="text-xs text-muted-foreground mt-1">Folder</p>
                      </div>
                      <div
                        className="ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          checked={isSelected}
                          onChange={(e) =>
                            toggleItemSelection(folder.id, "folder", e)
                          }
                          aria-label={`Select ${folder.name}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {files.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  isSelected={!!selectedItems[file.id]}
                  onSelect={() => {
                    toggleItemSelection(
                      file.id,
                      "file",
                      new Event("click") as unknown as React.SyntheticEvent
                    );
                  }}
                  onClick={() => handleFileClick(file)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        size="sm"
      >
        <FileUpload
          organizationId={currentOrganization?.id || ""}
          folderId={currentFolder?.id}
          onSuccess={() => {
            setShowUploadModal(false);
            refreshFiles();
          }}
          onCancel={() => setShowUploadModal(false)}
        />
      </Modal>

      <Modal
        open={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        size="sm"
      >
        <FolderCreate
          organizationId={currentOrganization?.id || ""}
          parentFolderId={currentFolder?.id}
          onSuccess={() => {
            setShowCreateFolderModal(false);
            refreshFiles();
          }}
          onCancel={() => setShowCreateFolderModal(false)}
        />
      </Modal>
    </div>
  );
};

export default FileExplorer;
