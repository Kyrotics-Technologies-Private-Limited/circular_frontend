// src/hooks/useOrganization.ts
import { useState, useEffect, useCallback } from 'react';
import { Organization } from '../types/Organization';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  addOrganizationMember,
  removeOrganizationMember,
  deleteOrganization
} from '../services/organization.service';

interface UseOrganizationReturn {
  organizations: Organization[];
  currentOrganization: Organization | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  fetchOrganizations: () => Promise<void>;
  fetchOrganization: (id: string) => Promise<Organization>;
  createNewOrganization: (data: { name: string; description?: string }) => Promise<Organization>;
  updateOrganizationDetails: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  addMember: (id: string, email: string, role: 'member' | 'admin') => Promise<void>;
  removeMember: (id: string, userId: string) => Promise<void>;
  deleteSelectedOrganization: (id: string) => Promise<void>;
  setCurrentOrganization: (organization: Organization | null) => void;
  clearError: () => void;
  clearSuccessMessage: () => void;
}

/**
 * Custom hook for organization management
 */
const useOrganization = (): UseOrganizationReturn => {
  const { currentUser } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Fetch all organizations for the current user
  const fetchOrganizations = async (): Promise<void> => {
    if (!currentUser) {
      setOrganizations([]);
      setCurrentOrganization(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const userOrganizations = await getUserOrganizations();
      setOrganizations(userOrganizations);
      
      // Set current organization to the first one if not set
      if (userOrganizations.length > 0 && !currentOrganization) {
        setCurrentOrganization(userOrganizations[0]);
      } else if (currentOrganization) {
        // Make sure current organization is still in the list
        const stillExists = userOrganizations.some(org => org.id === currentOrganization.id);
        if (!stillExists) {
          setCurrentOrganization(userOrganizations.length > 0 ? userOrganizations[0] : null);
        } else {
          // Update current organization data
          const updatedOrg = userOrganizations.find(org => org.id === currentOrganization.id);
          if (updatedOrg) {
            setCurrentOrganization(updatedOrg);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching organizations:', err);
      setError(err.message || 'Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch a specific organization
  const fetchOrganization = async (id: string): Promise<Organization> => {
    try {
      setLoading(true);
      setError(null);
      
      const organization = await getOrganization(id);
      return organization;
    } catch (err: any) {
      console.error('Error fetching organization:', err);
      setError(err.message || 'Failed to fetch organization');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new organization
  const createNewOrganization = async (data: { name: string; description?: string }): Promise<Organization> => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const newOrganization = await createOrganization(data);
      
      // Refresh organizations list
      await fetchOrganizations();
      
      setSuccessMessage('Organization created successfully');
      
      // Set as current organization
      setCurrentOrganization(newOrganization);
      
      return newOrganization;
    } catch (err: any) {
      console.error('Error creating organization:', err);
      setError(err.message || 'Failed to create organization');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Update organization details
  const updateOrganizationDetails = async (id: string, data: { name?: string; description?: string }): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      await updateOrganization(id, data);
      
      // Refresh the organizations list
      await fetchOrganizations();
      
      setSuccessMessage('Organization updated successfully');
    } catch (err: any) {
      console.error('Error updating organization:', err);
      setError(err.message || 'Failed to update organization');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Add a member to an organization
  const addMember = async (id: string, email: string, role: 'member' | 'admin'): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      await addOrganizationMember(id, { email, role });
      
      // Refresh the organization
      if (currentOrganization && currentOrganization.id === id) {
        const updatedOrg = await getOrganization(id);
        setCurrentOrganization(updatedOrg);
      }
      
      setSuccessMessage('Member added successfully');
    } catch (err: any) {
      console.error('Error adding member:', err);
      setError(err.message || 'Failed to add member');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Remove a member from an organization
  const removeMember = async (id: string, userId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      await removeOrganizationMember(id, userId);
      
      // Refresh the organization
      if (currentOrganization && currentOrganization.id === id) {
        const updatedOrg = await getOrganization(id);
        setCurrentOrganization(updatedOrg);
      }
      
      setSuccessMessage('Member removed successfully');
    } catch (err: any) {
      console.error('Error removing member:', err);
      setError(err.message || 'Failed to remove member');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Delete an organization
  const deleteSelectedOrganization = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      await deleteOrganization(id);
      
      // Refresh organizations list
      await fetchOrganizations();
      
      setSuccessMessage('Organization deleted successfully');
    } catch (err: any) {
      console.error('Error deleting organization:', err);
      setError(err.message || 'Failed to delete organization');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Clear success message
  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage(null);
  }, []);
  
  // Fetch organizations when user changes
  useEffect(() => {
    fetchOrganizations();
  }, [currentUser]);
  
  return {
    organizations,
    currentOrganization,
    loading,
    error,
    successMessage,
    fetchOrganizations,
    fetchOrganization,
    createNewOrganization,
    updateOrganizationDetails,
    addMember,
    removeMember,
    deleteSelectedOrganization,
    setCurrentOrganization,
    clearError,
    clearSuccessMessage
  };
};

export default useOrganization;