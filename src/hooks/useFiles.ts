// src/hooks/useFiles.ts
import { useState, useEffect, useCallback } from 'react';
import { FileItem, Folder } from '../types/File';
import {
  // getFiles,
  getFilesByFolderId,
  getFolders,
  uploadFile,
  deleteFile,
  deleteFolder,
  createFolder,
  downloadFile as downloadFileService,
  shareFile,
  shareFolder
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
  sharing: boolean;
  error: string | null;
  navigateToFolder: (folder: Folder | null) => Promise<void>;
  navigateUp: () => Promise<void>;
  refreshFiles: () => Promise<void>;
  uploadFiles: (files: FileList, organizationId?: string, folderId?: string) => Promise<void>;
  createNewFolder: (name: string, organizationId?: string, parentFolderId?: string) => Promise<Folder>;
  deleteSelectedFile: (fileId: string) => Promise<void>;
  deleteSelectedFolder: (folderId: string) => Promise<void>;
  downloadFile: (fileUrl: string, fileName: string) => Promise<void>;
  shareSelectedFile: (fileId: string, userIds: string[]) => Promise<void>;
  shareSelectedFolder: (folderId: string, userIds: string[]) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for file and folder management
 * Works with both individual and organization users
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
  const [sharing, setSharing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Build the current path
  const buildPath = async (folder: Folder | null): Promise<Folder[]> => {
    if (!folder) {
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
    try {
      setLoading(true);
      setError(null);
      
      // Get files and folders for current organization and folder
      const [filesData, foldersData] = await Promise.all([
        getFilesByFolderId(organizationId, currentFolder?.id),
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
    
    if (folder) {
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
    if (!currentFolder) {
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
  const uploadFiles = async (
    files: FileList, 
    orgId?: string, 
    folderId?: string
  ): Promise<void> => {
    if (files.length === 0) {
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      const uploadPromises = [];
      
      for (let i = 0; i < files.length; i++) {
        // Pass the organization ID from props or from the function parameters
        uploadPromises.push(uploadFile(files[i], orgId || organizationId, folderId));
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
  const createNewFolder = async (
    name: string, 
    orgId?: string, 
    parentFolderId?: string
  ): Promise<Folder> => {
    try {
      setCreating(true);
      setError(null);
      
      // Use the organization ID from props or from the function parameters
      const folder = await createFolder(name, orgId || organizationId, parentFolderId);
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
  
  // Share file with other users
  const shareSelectedFile = async (fileId: string, userIds: string[]): Promise<void> => {
    try {
      setSharing(true);
      setError(null);
      
      await shareFile(fileId, userIds);
      await refreshFiles();
    } catch (err: any) {
      console.error('Error sharing file:', err);
      setError(err.message || 'Failed to share file');
      throw err;
    } finally {
      setSharing(false);
    }
  };
  
  // Share folder with other users
  const shareSelectedFolder = async (folderId: string, userIds: string[]): Promise<void> => {
    try {
      setSharing(true);
      setError(null);
      
      await shareFolder(folderId, userIds);
      await refreshFiles();
    } catch (err: any) {
      console.error('Error sharing folder:', err);
      setError(err.message || 'Failed to share folder');
      throw err;
    } finally {
      setSharing(false);
    }
  };
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Initial load
  useEffect(() => {
    fetchFilesAndFolders();
  }, [fetchFilesAndFolders]);
  
  return {
    files,
    folders,
    currentFolder,
    currentPath,
    loading,
    uploading,
    deleting,
    creating,
    sharing,
    error,
    navigateToFolder,
    navigateUp,
    refreshFiles,
    uploadFiles,
    createNewFolder,
    deleteSelectedFile,
    deleteSelectedFolder,
    downloadFile: downloadSelectedFile,
    shareSelectedFile,
    shareSelectedFolder,
    clearError
  };
};

export default useFiles;