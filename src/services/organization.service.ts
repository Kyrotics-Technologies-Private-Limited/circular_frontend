// src/services/organization.service.ts
import api from './api';
import { Organization } from '../types/Organization';

/**
 * Create a new organization
 */
export const createOrganization = async (data: { name: string; description?: string }): Promise<Organization> => {
  try {
    const response = await api.post('/organizations', data);
    return response.data.organization;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
};

/**
 * Get all organizations for the current user
 */
export const getUserOrganizations = async (): Promise<Organization[]> => {
  try {
    const response = await api.get('/organizations');
    return response.data.organizations;
  } catch (error) {
    console.error('Error getting user organizations:', error);
    throw error;
  }
};

/**
 * Get organization details
 */
export const getOrganization = async (organizationId: string): Promise<Organization> => {
  try {
    const response = await api.get(`/organizations/${organizationId}`);
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
  organizationId: string,
  data: { name?: string; description?: string }
): Promise<void> => {
  try {
    await api.put(`/organizations/${organizationId}`, data);
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
};

/**
 * Add a member to organization
 */
export const addOrganizationMember = async (
  organizationId: string,
  data: { email: string; role: 'member' | 'admin' }
): Promise<void> => {
  try {
    await api.post(`/organizations/${organizationId}/members`, data);
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

/**
 * Remove a member from organization
 */
export const removeOrganizationMember = async (organizationId: string, userId: string): Promise<void> => {
  try {
    await api.delete(`/organizations/${organizationId}/members/${userId}`);
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

/**
 * Delete an organization
 */
export const deleteOrganization = async (organizationId: string): Promise<void> => {
  try {
    await api.delete(`/organizations/${organizationId}`);
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw error;
  }
};
