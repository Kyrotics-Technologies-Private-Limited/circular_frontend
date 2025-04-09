// src/services/share.service.ts
import api  from './api';
import { FileItem, Folder } from '../types/File';

// Updated type definitions
export interface UserForSharing {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  organizationMember: boolean;
}

export interface AccessUser {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  permission: 'owner' | 'view' | 'edit';
}

export interface AccessList {
  owner: AccessUser;
  sharedWith: AccessUser[];
  isPublic: boolean;
}

// Get all items shared with the current user
export const getSharedWithMe = async () => {
  try {
    const response = await api.get('/share/shared-with-me');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching shared items:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch shared items');
  }
};

// Make a file public within an organization
export const makeFilePublic = async (fileId: string, isPublic: boolean, organizationId?: string) => {
  try {
    const response = await api.patch(`/share/files/${fileId}/public`, {
      isPublic,
      organizationId: isPublic ? organizationId : undefined
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating file visibility:', error);
    throw new Error(error.response?.data?.message || 'Failed to update file visibility');
  }
};

// Make a folder public within an organization
export const makeFolderPublic = async (
  folderId: string, 
  isPublic: boolean, 
  organizationId?: string,
  includeContents: boolean = true
) => {
  try {
    const response = await api.patch(`/share/folders/${folderId}/public`, {
      isPublic,
      organizationId: isPublic ? organizationId : undefined,
      includeContents
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating folder visibility:', error);
    throw new Error(error.response?.data?.message || 'Failed to update folder visibility');
  }
};

// Get users for sharing
export const getUsersForSharing = async (organizationId?: string) => {
  try {
    const response = await api.get('/share/users', {
      params: { organizationId }
    });
    console.log(organizationId)
    console.log(response.data)
    return response.data.users;
  } catch (error: any) {
    console.error('Error fetching users for sharing:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

// Share a file with users
export const shareFileWithUsers = async (fileId: string, userIds: string[], permission: 'view' | 'edit' = 'view') => {
  try {
    const response = await api.post(`/share/files/${fileId}/share`, {
      userIds,
      permission
    });
    return response.data;
  } catch (error: any) {
    console.error('Error sharing file:', error);
    throw new Error(error.response?.data?.message || 'Failed to share file');
  }
};

// Share a folder with users
export const shareFolderWithUsers = async (
  folderId: string, 
  userIds: string[], 
  permission: 'view' | 'edit' = 'view',
  includeContents: boolean = true
) => {
  try {
    const response = await api.post(`/share/folders/${folderId}/share`, {
      userIds,
      permission,
      includeContents
    });
    return response.data;
  } catch (error: any) {
    console.error('Error sharing folder:', error);
    throw new Error(error.response?.data?.message || 'Failed to share folder');
  }
};

// Get file access list
export const getFileAccessList = async (fileId: string) => {
  try {
    const response = await api.get(`/share/files/${fileId}/access`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching file access list:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch access list');
  }
};

// Get folder access list
export const getFolderAccessList = async (folderId: string) => {
  try {
    const response = await api.get(`/share/folders/${folderId}/access`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching folder access list:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch access list');
  }
};

// Update file permission
export const updateFilePermission = async (fileId: string, userId: string, permission: 'view' | 'edit') => {
  try {
    const response = await api.patch(`/share/files/${fileId}/permissions/${userId}`, {
      permission
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating file permission:', error);
    throw new Error(error.response?.data?.message || 'Failed to update permission');
  }
};

// Update folder permission
export const updateFolderPermission = async (
  folderId: string, 
  userId: string, 
  permission: 'view' | 'edit',
  includeContents: boolean = true
) => {
  try {
    const response = await api.patch(`/share/folders/${folderId}/permissions/${userId}`, {
      permission,
      includeContents
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating folder permission:', error);
    throw new Error(error.response?.data?.message || 'Failed to update permission');
  }
};

// Remove file access
export const removeFileAccess = async (fileId: string, userId: string) => {
  try {
    const response = await api.delete(`/share/files/${fileId}/access/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error removing file access:', error);
    throw new Error(error.response?.data?.message || 'Failed to remove access');
  }
};

// Remove folder access
export const removeFolderAccess = async (folderId: string, userId: string, includeContents: boolean = true) => {
  try {
    const response = await api.delete(`/share/folders/${folderId}/access/${userId}`, {
      data: { includeContents }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error removing folder access:', error);
    throw new Error(error.response?.data?.message || 'Failed to remove access');
  }
};

// Generate sharing link
export const generateSharingLink = async (type: 'file' | 'folder', itemId: string, expiration?: number) => {
  try {
    const response = await api.get(`/share/link/${type}/${itemId}`, {
      params: { expiration }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error generating sharing link:', error);
    throw new Error(error.response?.data?.message || 'Failed to generate link');
  }
};