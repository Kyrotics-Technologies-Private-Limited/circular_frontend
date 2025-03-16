// src/services/file.service.ts
import api from './api';
import { FileItem, Folder } from '../types/File';

/**
 * Upload a file
 */
export const uploadFile = async (
  file: File,
  organizationId: string,
  folderId?: string
): Promise<FileItem> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('organizationId', organizationId);
    
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
 * Get all files for an organization or folder
 */
// export const getFiles = async (
//   organizationId: string,
//   folderId?: string
// ): Promise<FileItem[]> => {
//   try {
//     const params: Record<string, string> = { organizationId };
    
//     if (folderId) {
//       params.folderId = folderId;
//     }
    
//     const response = await api.get('/files', { params });
//     return response.data.files;
//   } catch (error) {
//     console.error('Error getting files:', error);
//     throw error;
//   }
// };

// Update getFiles function in file.service.ts
export const getFiles = async (
  organizationId: string,

): Promise<FileItem[]> => {
  try {
    if (!organizationId) {
      return [];
    }
    
    const params: Record<string, string> = { organizationId };
    
    const response = await api.get('/files', { params });
    return response.data.files;
  } catch (error) {
    console.error('Error getting files:', error);
    throw error;
  }
};

export const getFilesByFolderId = async (
  organizationId: string,
  folderId?: string
): Promise<FileItem[]> => {
  try {
    if (!organizationId) {
      return [];
    }
    
    const params: Record<string, string> = { organizationId };
    
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
 */
export const createFolder = async (
  name: string,
  organizationId: string,
  parentFolderId?: string
): Promise<Folder> => {
  try {
    const data: {
      name: string;
      organizationId: string;
      parentFolderId?: string;
    } = {
      name,
      organizationId
    };
    
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
 * Get all folders for an organization or parent folder
 */
export const getFolders = async (
  organizationId: string,
  parentFolderId?: string
): Promise<Folder[]> => {
  try {
    const params: Record<string, string> = { organizationId };
    
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
