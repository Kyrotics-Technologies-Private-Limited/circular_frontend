// src/services/file.service.ts
import api from './api';
import { FileItem, Folder } from '../types/File';

/**
 * Upload a file
 * @param file File to upload
 * @param organizationId Optional organization ID (for org users)
 * @param folderId Optional folder ID
 */
export const uploadFile = async (
  file: File,
  organizationId?: string,
  folderId?: string
): Promise<FileItem> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Only append organizationId if it exists
    if (organizationId) {
      formData.append('organizationId', organizationId);
    }
    
    if (folderId) {
      formData.append('folderId', folderId);
    }
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.file;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Get all files for current user or organization
 * @param organizationId Optional organization ID (for org users)
 */
export const getFiles = async (
  organizationId?: string
): Promise<FileItem[]> => {
  try {
    const params: Record<string, string> = {};
    
    // console.log('organizationId:', organizationId);
    
    // Only include organizationId in params if it exists
    if (organizationId) {
      params.organizationId = organizationId;
    }
    
    const response = await api.get('/files', { params });
    return response.data.files;
  } catch (error) {
    console.error('Error getting files:', error);
    throw error;
  }
};

/**
 * Get files by folder ID
 * @param organizationId Optional organization ID (for org users)
 * @param folderId Optional folder ID (null for root folder)
 */
export const getFilesByFolderId = async (
  organizationId?: string,
  folderId?: string
): Promise<FileItem[]> => {
  try {
    const params: Record<string, string> = {};

    // console.log('organizationId:', organizationId);
    // console.log('folderId:', folderId);
    
    // Only include organizationId in params if it exists
    if (organizationId) {
      params.organizationId = organizationId;
    }
    
    if (folderId) {
      params.folderId = folderId;
    }
    
    const response = await api.get('/files/getFilesByFolderId', { params });
    return response.data.files;
  } catch (error) {
    console.error('Error getting files:', error);
    throw error;
  }
};

/**
 * Get a specific file by ID
 */
export const getFileById = async (fileId: string): Promise<FileItem> => {
  try {
    const response = await api.get(`/files/${fileId}`);
    return response.data.file;
  } catch (error) {
    console.error('Error getting file:', error);
    throw error;
  }
};

/**
 * Share a file with other users
 * @param fileId File ID to share
 * @param userIds Array of user IDs to share with
 */
export const shareFile = async (fileId: string, userIds: string[]): Promise<void> => {
  try {
    await api.post(`/files/${fileId}/share`, { userIds });
  } catch (error) {
    console.error('Error sharing file:', error);
    throw error;
  }
};

/**
 * Rename a file
 * @param fileId File ID to rename
 * @param newName New file name
 */
export const renameFile = async (fileId: string, newName: string): Promise<FileItem> => {
  try {
    const response = await api.post(`/files/${fileId}/renameFile`, { newName });
    return response.data.file;
  } catch (error) {
    console.error('Error renaming file:', error);
    throw error;
  }
};

/**
 * Delete a file
 */
export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    await api.delete(`/files/${fileId}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Create a new folder
 * @param name Folder name
 * @param organizationId Optional organization ID (for org users)
 * @param parentFolderId Optional parent folder ID
 */
export const createFolder = async (
  name: string,
  organizationId?: string,
  parentFolderId?: string
): Promise<Folder> => {
  try {
    const data: {
      name: string;
      organizationId?: string;
      parentFolderId?: string;
    } = {
      name
    };
    
    // Only include organizationId if it exists
    if (organizationId) {
      data.organizationId = organizationId;
    }
    
    if (parentFolderId) {
      data.parentFolderId = parentFolderId;
    }
    
    const response = await api.post('/files/folders', data);
    return response.data.folder;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

/**
 * Get all folders for current user or organization
 * @param organizationId Optional organization ID (for org users)
 * @param parentFolderId Optional parent folder ID
 */
export const getFolders = async (
  organizationId?: string,
  parentFolderId?: string
): Promise<Folder[]> => {
  try {
    const params: Record<string, string> = {};
    
    // Only include organizationId in params if it exists
    if (organizationId) {
      params.organizationId = organizationId;
    }
    
    if (parentFolderId) {
      params.parentFolderId = parentFolderId;
    }
    
    const response = await api.get('/files/folders', { params });
    return response.data.folders;
  } catch (error) {
    console.error('Error getting folders:', error);
    throw error;
  }
};

/**
 * Share a folder with other users
 * @param folderId Folder ID to share
 * @param userIds Array of user IDs to share with
 */
export const shareFolder = async (folderId: string, userIds: string[]): Promise<void> => {
  try {
    await api.post(`/files/folders/${folderId}/share`, { userIds });
  } catch (error) {
    console.error('Error sharing folder:', error);
    throw error;
  }
};

/**
 * Delete a folder
 */
export const deleteFolder = async (folderId: string): Promise<void> => {
  try {
    await api.delete(`/files/folders/${folderId}`);
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

/**
 * Download a file
 */
export const downloadFile = async (fileUrl: string, fileName: string): Promise<void> => {
  try {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};