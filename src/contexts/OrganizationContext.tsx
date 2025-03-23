// src/contexts/OrganizationContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organization } from '../types/Organization';
import { getUserOrganizations } from '../services/organization.service';
import { useAuth } from './AuthContext';

// Define UserType as a union type
export type UserType = 'individual' | 'organization';

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  userType: UserType;
  loading: boolean;
  error: string | null;
  setCurrentOrganization: (organization: Organization | null) => void;
  setUserType: (type: UserType) => void;
  refreshOrganizations: () => Promise<void>;
  clearError: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider = ({ children }: OrganizationProviderProps): React.ReactElement => {
  const { currentUser } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userType, setUserType] = useState<UserType>(
    // Check localStorage for previous selection, default to individual if not found
    (localStorage.getItem('userType') as UserType) || 'individual'
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    if (!currentUser) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userOrganizations = await getUserOrganizations();
      setOrganizations(userOrganizations);
      
      // Only set organization if in organization mode
      if (userType === 'organization') {
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
      } else {
        // In individual mode, ensure currentOrganization is null
        setCurrentOrganization(null);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  // Update userType in localStorage when it changes
  const handleSetUserType = (type: UserType) => {
    localStorage.setItem('userType', type);
    setUserType(type);
    
    // Reset currentOrganization if switching to individual mode
    if (type === 'individual') {
      setCurrentOrganization(null);
    } else if (type === 'organization' && !currentOrganization && organizations.length > 0) {
      // Set first organization if switching to organization mode and none is set
      setCurrentOrganization(organizations[0]);
    }
  };

  // Fetch organizations when user changes
  useEffect(() => {
    fetchOrganizations();
  }, [currentUser]);

  // Refresh organizations when userType changes
  useEffect(() => {
    fetchOrganizations();
  }, [userType]);

  const refreshOrganizations = async () => {
    await fetchOrganizations();
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    organizations,
    currentOrganization,
    userType,
    loading,
    error,
    setCurrentOrganization,
    setUserType: handleSetUserType,
    refreshOrganizations,
    clearError
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};