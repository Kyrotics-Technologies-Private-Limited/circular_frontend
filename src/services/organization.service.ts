// src/services/organization.service.ts
import api from './api';
import { Organization } from '../types/Organization';
import { User } from '../types/User';

/**
 * Create a new organization
 */
export const createOrganization = async (data: { name: string; CIN: string }): Promise<Organization> => {
  try {
    const response = await api.post('/organizations', data);
    return response.data.organization;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
};

/**
 * Get all organizations (super_admin only)
 */
export const getAllOrganizations = async (): Promise<Organization[]> => {
  try {
    const response = await api.get('/organizations/all');
    return response.data.organizations;
  } catch (error) {
    console.error('Error getting all organizations:', error);
    throw error;
  }
};

/**
 * Get current user's organization
 */
export const getUserOrganization = async (): Promise<Organization> => {
  try {
    const response = await api.get('/organizations/user');
    return response.data.organization;
  } catch (error) {
    console.error('Error getting user organization:', error);
    throw error;
  }
};

/**
 * Get organization details
 */
export const getOrganization = async (orgId: string): Promise<Organization> => {
  try {
    const response = await api.get(`/organizations/${orgId}`);
    return response.data.organization;
  } catch (error) {
    console.error('Error getting organization:', error);
    throw error;
  }
};

/**
 * Update organization
 */
export const updateOrganization = async (
  orgId: string,
  data: { name?: string; CIN?: string; status?: 'pending' | 'approved' | 'rejected' }
): Promise<void> => {
  try {
    await api.put(`/organizations/${orgId}`, data);
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
};

/**
 * Get all users in an organization
 */
export const getOrganizationUsers = async (orgId: string): Promise<User[]> => {
  try {
    const response = await api.get(`/organizations/${orgId}/users`);
    return response.data.users;
  } catch (error) {
    console.error('Error getting organization users:', error);
    throw error;
  }
};

/**
 * Add a user to organization
 */
export const addOrganizationUser = async (
  orgId: string,
  data: { email: string; role: 'user' | 'admin' }
): Promise<void> => {
  try {
    await api.post(`/organizations/${orgId}/users`, data);
  } catch (error) {
    console.error('Error adding user to organization:', error);
    throw error;
  }
};

/**
 * Remove a user from organization
 */
export const removeOrganizationUser = async (orgId: string, userId: string): Promise<void> => {
  try {
    await api.delete(`/organizations/${orgId}/users/${userId}`);
  } catch (error) {
    console.error('Error removing user from organization:', error);
    throw error;
  }
};

/**
 * Update user role within organization
 */
export const updateUserRole = async (
  orgId: string,
  userId: string,
  data: { role: 'user' | 'admin' }
): Promise<void> => {
  try {
    await api.put(`/organizations/${orgId}/users/${userId}/role`, data);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Delete an organization (super_admin only)
 */
export const deleteOrganization = async (orgId: string): Promise<void> => {
  try {
    await api.delete(`/organizations/${orgId}`);
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw error;
  }
};

// export default {
//   createOrganization,
//   getAllOrganizations,
//   getUserOrganization,
//   getOrganization,
//   updateOrganization,
//   getOrganizationUsers,
//   addOrganizationUser,
//   removeOrganizationUser,
//   updateUserRole,
//   deleteOrganization
// };