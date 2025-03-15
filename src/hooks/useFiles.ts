// src/hooks/useFiles.ts
import { useState, useEffect, useCallback } from 'react';
import { FileItem, Folder } from '../types/File';
import {
  getFiles,
  getFolders,
  uploadFile,
  deleteFile,
  deleteFolder,
  createFolder,
  downloadFile as downloadFileService
} from '../services/file.service';

interface UseFilesReturn {
  files: FileItem[];
  folders: Folder[];
  currentFolder: Folder | null;
  currentPath: Folder[];
  loading: boolean;
  uploading: boolean;
  deleting: boolean;
  creating: boolean;
  error: string | null;
  navigateToFolder: (folder: Folder | null) => Promise<void>;
  navigateUp: () => Promise<void>;
  refreshFiles: () => Promise<void>;
  uploadFiles: (files: FileList, organizationId: string, folderId?: string) => Promise<void>;
  createNewFolder: (name: string, organizationId: string, parentFolderId?: string) => Promise<Folder>;
  deleteSelectedFile: (fileId: string) => Promise<void>;
  deleteSelectedFolder: (folderId: string) => Promise<void>;
  downloadFile: (fileUrl: string, fileName: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for file and folder management
 */
const useFiles = (organizationId?: string): UseFilesReturn => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [currentPath, setCurrentPath] = useState<Folder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Build the current path
  const buildPath = async (folder: Folder | null): Promise<Folder[]> => {
    if (!folder || !organizationId) {
      return [];
    }
    
    const path: Folder[] = [folder];
    let currentParent = folder.parentFolderId;
    
    // Follow parent folder chain to build path
    while (currentParent) {
      try {
        // This would ideally be a separate function to get a single folder
        const parentFolders = await getFolders(organizationId);
        const parentFolder = parentFolders.find(f => f.id === currentParent);
        
        if (parentFolder) {
          path.unshift(parentFolder);
          currentParent = parentFolder.parentFolderId;
        } else {
          break;
        }
      } catch (err) {
        console.error('Error building path:', err);
        break;
      }
    }
    
    return path;
  };
  
  // Fetch files and folders
  const fetchFilesAndFolders = useCallback(async () => {
    if (!organizationId) {
      setFiles([]);
      setFolders([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get files and folders for current organization and folder
      const [filesData, foldersData] = await Promise.all([
        getFiles(organizationId, currentFolder?.id),
        getFolders(organizationId, currentFolder?.id)
      ]);
      
      setFiles(filesData);
      setFolders(foldersData);
    } catch (err: any) {
      console.error('Error fetching files and folders:', err);
      setError(err.message || 'Failed to load files and folders');
    } finally {
      setLoading(false);
    }
  }, [organizationId, currentFolder?.id]);
  
  // Refresh files and folders
  const refreshFiles = async (): Promise<void> => {
    await fetchFilesAndFolders();
  };
  
  // Navigate to folder
  const navigateToFolder = async (folder: Folder | null): Promise<void> => {
    setCurrentFolder(folder);
    
    if (folder && organizationId) {
      const path = await buildPath(folder);
      setCurrentPath(path);
    } else {
      setCurrentPath([]);
    }
    
    // Fetch files for the new folder
    await fetchFilesAndFolders();
  };
  
  // Navigate up one level
  const navigateUp = async (): Promise<void> => {
    if (!currentFolder || !organizationId) {
      return;
    }
    
    const parentId = currentFolder.parentFolderId;
    
    if (parentId) {
      try {
        const parentFolders = await getFolders(organizationId);
        const parentFolder = parentFolders.find(f => f.id === parentId);
        
        if (parentFolder) {
          await navigateToFolder(parentFolder);
        } else {
          await navigateToFolder(null);
        }
      } catch (err: any) {
        console.error('Error navigating up:', err);
        setError(err.message || 'Failed to navigate to parent folder');
      }
    } else {
      await navigateToFolder(null);
    }
  };
  
  // Upload files
  const uploadFiles = async (files: FileList, orgId: string, folderId?: string): Promise<void> => {
    if (files.length === 0 || !orgId) {
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      const uploadPromises = [];
      
      for (let i = 0; i < files.length; i++) {
        uploadPromises.push(uploadFile(files[i], orgId, folderId));
      }
      
      await Promise.all(uploadPromises);
      await refreshFiles();
    } catch (err: any) {
      console.error('Error uploading files:', err);
      setError(err.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };
  
  // Create new folder
  const createNewFolder = async (name: string, orgId: string, parentFolderId?: string): Promise<Folder> => {
    try {
      setCreating(true);
      setError(null);
      
      const folder = await createFolder(name, orgId, parentFolderId);
      await refreshFiles();
      
      return folder;
    } catch (err: any) {
      console.error('Error creating folder:', err);
      setError(err.message || 'Failed to create folder');
      throw err;
    } finally {
      setCreating(false);
    }
  };
  
  // Delete file
  const deleteSelectedFile = async (fileId: string): Promise<void> => {
    try {
      setDeleting(true);
      setError(null);
      
      await deleteFile(fileId);
      await refreshFiles();
    } catch (err: any) {
      console.error('Error deleting file:', err);
      setError(err.message || 'Failed to delete file');
      throw err;
    } finally {
      setDeleting(false);
    }
  };
  
  // Delete folder
  const deleteSelectedFolder = async (folderId: string): Promise<void> => {
    try {
      setDeleting(true);
      setError(null);
      
      await deleteFolder(folderId);
      await refreshFiles();
    } catch (err: any) {
      console.error('Error deleting folder:', err);
      setError(err.message || 'Failed to delete folder');
      throw err;
    } finally {
      setDeleting(false);
    }
  };
  
  // Download file
  const downloadSelectedFile = async (fileUrl: string, fileName: string): Promise<void> => {
    try {
      setError(null);
      
      await downloadFileService(fileUrl, fileName);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      setError(err.message || 'Failed to download file');
      throw err;
    }
  };
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Initial load
  useEffect(() => {
    if (organizationId) {
      fetchFilesAndFolders();
    }
  }, [organizationId, fetchFilesAndFolders]);
  
  return {
    files,
    folders,
    currentFolder,
    currentPath,
    loading,
    uploading,
    deleting,
    creating,
    error,
    navigateToFolder,
    navigateUp,
    refreshFiles,
    uploadFiles,
    createNewFolder,
    deleteSelectedFile: deleteSelectedFolder,
    deleteSelectedFolder,
    downloadFile: downloadSelectedFile,
    clearError
  };
};

export default useFiles;