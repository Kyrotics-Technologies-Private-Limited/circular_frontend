// // src/contexts/OrganizationContext.tsx
// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { Organization } from '../types/Organization';
// import { getAllOrganizations } from '../services/organization.service';
// import { useAuth } from './AuthContext';

// // Define UserType as a union type
// export type UserType = 'individual' | 'organization';

// interface OrganizationContextType {
//   organizations: Organization[];
//   currentOrganization: Organization | null;
//   userType: UserType;
//   loading: boolean;
//   error: string | null;
//   setCurrentOrganization: (organization: Organization | null) => void;
//   setUserType: (type: UserType) => void;
//   refreshOrganizations: () => Promise<void>;
//   clearError: () => void;
// }

// const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// export const useOrganization = (): OrganizationContextType => {
//   const context = useContext(OrganizationContext);
//   if (!context) {
//     throw new Error('useOrganization must be used within an OrganizationProvider');
//   }
//   return context;
// };

// interface OrganizationProviderProps {
//   children: ReactNode;
// }

// export const OrganizationProvider = ({ children }: OrganizationProviderProps): React.ReactElement => {
//   const { currentUser } = useAuth();
//   const [organizations, setOrganizations] = useState<Organization[]>([]);
//   const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
//   const [userType, setUserType] = useState<UserType>(
//     // Check localStorage for previous selection, default to individual if not found
//     (localStorage.getItem('userType') as UserType) || 'individual'
//   );
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchOrganizations = async () => {
//     if (!currentUser) {
//       setOrganizations([]);
//       setCurrentOrganization(null);
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       const userOrganizations = await getAllOrganizations();
//       setOrganizations(userOrganizations);
      
//       // Only set organization if in organization mode
//       if (userType === 'organization') {
//         // Set current organization to the first one if not set
//         if (userOrganizations.length > 0 && !currentOrganization) {
//           setCurrentOrganization(userOrganizations[0]);
//         } else if (currentOrganization) {
//           // Make sure current organization is still in the list
//           const stillExists = userOrganizations.some(org => org.id === currentOrganization.id);
//           if (!stillExists) {
//             setCurrentOrganization(userOrganizations.length > 0 ? userOrganizations[0] : null);
//           } else {
//             // Update current organization data
//             const updatedOrg = userOrganizations.find(org => org.id === currentOrganization.id);
//             if (updatedOrg) {
//               setCurrentOrganization(updatedOrg);
//             }
//           }
//         }
//       } else {
//         // In individual mode, ensure currentOrganization is null
//         setCurrentOrganization(null);
//       }
      
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching organizations:', err);
//       setError('Failed to fetch organizations');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update userType in localStorage when it changes
//   const handleSetUserType = (type: UserType) => {
//     localStorage.setItem('userType', type);
//     setUserType(type);
    
//     // Reset currentOrganization if switching to individual mode
//     if (type === 'individual') {
//       setCurrentOrganization(null);
//     } else if (type === 'organization' && !currentOrganization && organizations.length > 0) {
//       // Set first organization if switching to organization mode and none is set
//       setCurrentOrganization(organizations[0]);
//     }
//   };

//   // Fetch organizations when user changes
//   useEffect(() => {
//     fetchOrganizations();
//   }, [currentUser]);

//   // Refresh organizations when userType changes
//   useEffect(() => {
//     fetchOrganizations();
//   }, [userType]);

//   const refreshOrganizations = async () => {
//     await fetchOrganizations();
//   };

//   const clearError = () => {
//     setError(null);
//   };

//   const value = {
//     organizations,
//     currentOrganization,
//     userType,
//     loading,
//     error,
//     setCurrentOrganization,
//     setUserType: handleSetUserType,
//     refreshOrganizations,
//     clearError
//   };

//   return (
//     <OrganizationContext.Provider value={value}>
//       {children}
//     </OrganizationContext.Provider>
//   );
// };

// src/contexts/OrganizationContext.tsx
// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { Organization } from '../types/Organization';
// import { getAllOrganizations, getOrganization } from '../services/organization.service';
// import { useAuth } from './AuthContext';

// // Define UserType as a union type
// export type UserType = 'individual' | 'organization';

// interface OrganizationContextType {
//   organizations: Organization[];
//   currentOrganization: Organization | null;
//   userType: UserType;
//   loading: boolean;
//   error: string | null;
//   setCurrentOrganization: (organization: Organization | null) => void;
//   setUserType: (type: UserType) => void;
//   refreshOrganizations: () => Promise<void>;
//   clearError: () => void;
// }

// const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// export const useOrganization = (): OrganizationContextType => {
//   const context = useContext(OrganizationContext);
//   if (!context) {
//     throw new Error('useOrganization must be used within an OrganizationProvider');
//   }
//   return context;
// };

// interface OrganizationProviderProps {
//   children: ReactNode;
// }

// export const OrganizationProvider = ({ children }: OrganizationProviderProps): React.ReactElement => {
//   const { currentUser } = useAuth();
//   const [organizations, setOrganizations] = useState<Organization[]>([]);
//   const [userOrganization, setUserOrganization] = useState<Organization | null>(null);
//   const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
//   const [userType, setUserType] = useState<UserType>(
//     // Check localStorage for previous selection, default to individual if not found
//     (localStorage.getItem('userType') as UserType) || 'individual'
//   );
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchOrganizations = async () => {
//     if (!currentUser) {
//       setOrganizations([]);
//       setCurrentOrganization(null);
//       setLoading(false);
//       return;
//     }

//     // Get user role and orgId
//     const userRole = currentUser.role || '';
//     const userOrgId = currentUser.orgId || null;
//     try {
//       setLoading(true);
      
//       // Different behavior based on user role
//       if (userRole === 'super_admin') {
//         // Super admin can see all organizations
//         const allOrganizations = await getAllOrganizations();
//         setOrganizations(allOrganizations);
        
//         // Set current organization if in organization mode
//         if (userType === 'organization') {
//           if (allOrganizations.length > 0 && !currentOrganization) {
//             setCurrentOrganization(allOrganizations[0]);
//           } else if (currentOrganization) {
//             // Update current organization if it still exists
//             const stillExists = allOrganizations.some(org => org.id === currentOrganization.id);
//             if (!stillExists) {
//               setCurrentOrganization(allOrganizations.length > 0 ? allOrganizations[0] : null);
//             } else {
//               const updatedOrg = allOrganizations.find(org => org.id === currentOrganization.id);
//               if (updatedOrg) {
//                 setCurrentOrganization(updatedOrg);
//               }
//             }
//           }
//         }
//       } else if (userRole === 'admin' && userOrgId) {
//         // Admin can only see their organization, get details using the orgId from currentUser
//         try {
//           const userOrg = await getOrganization(userOrgId);
          
//           // Set as both the list and current organization
//           setUserOrganization(userOrg);
//           console.log("User Type",userType)
          
//           console.log('ORGANIZATIONS:', userOrganization);
//           if (userType === 'organization') {
//             setCurrentOrganization(userOrg);
//           }
//         } catch (err) {
//           console.error('Error fetching organization details:', err);
//           setOrganizations([]);
//           setCurrentOrganization(null);
//         }
//       } else {
//         // Regular user - no organization access
//         setOrganizations([]);
//         setCurrentOrganization(null);
//       }
      
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching organizations:', err);
//       setError('Failed to fetch organizations');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update userType in localStorage when it changes
//   const handleSetUserType = (type: UserType) => {
//     localStorage.setItem('userType', type);
//     setUserType(type);
    
//     // Reset currentOrganization if switching to individual mode
//     if (type === 'individual') {
//       setCurrentOrganization(null);
//     } else if (type === 'organization' && !currentOrganization && organizations.length > 0) {
//       // Set first organization if switching to organization mode and none is set
//       setCurrentOrganization(organizations[0]);
//     }
//   };

//   // Fetch organizations when user changes
//   useEffect(() => {
//     fetchOrganizations();
//   }, [currentUser]);

//   // Refresh organizations when userType changes
//   useEffect(() => {
//     fetchOrganizations();
//   }, [userType]);

//   const refreshOrganizations = async () => {
//     await fetchOrganizations();
//   };

//   const clearError = () => {
//     setError(null);
//   };

//   console.log('CURRENT ORGANIZATION:', currentOrganization);

//   const value = {
//     organizations,
//     currentOrganization,
//     userType,
//     loading,
//     error,
//     setCurrentOrganization,
//     setUserType: handleSetUserType,
//     refreshOrganizations,
//     clearError
//   };

//   return (
//     <OrganizationContext.Provider value={value}>
//       {children}
//     </OrganizationContext.Provider>
//   );
// };

// src/contexts/OrganizationContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organization } from '../types/Organization';
import { getAllOrganizations, getOrganization } from '../services/organization.service';
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
  
  // Determine initial userType based on user data
  const determineInitialUserType = (): UserType => {
    // If there's stored preference, use it
    const storedType = localStorage.getItem('userType') as UserType;
    if (storedType) return storedType;
    
    // If no stored preference but user is admin/super_admin or has an orgId, default to organization
    if (currentUser) {
      const userRole = currentUser.role || '';
      const userOrgId = currentUser.orgId;
      
      if (userRole === 'admin' || userRole === 'super_admin' || userOrgId) {
        return 'organization';
      }
    }
    
    // Default to individual
    return 'individual';
  };
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userType, setUserType] = useState<UserType>(determineInitialUserType());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Update userType when user changes
  useEffect(() => {
    if (currentUser) {
      const newType = determineInitialUserType();
      if (newType !== userType) {
        setUserType(newType);
        localStorage.setItem('userType', newType);
      }
    }
  }, [currentUser]);

  const fetchOrganizations = async () => {
    if (!currentUser) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setLoading(false);
      return;
    }

    // Get user role and orgId
    const userRole = currentUser.role || '';
    const userOrgId = currentUser.orgId || null;
    
    try {
      setLoading(true);
      
      // Different behavior based on user role
      if (userRole === 'super_admin') {
        // Super admin can see all organizations
        const allOrganizations = await getAllOrganizations();
        setOrganizations(allOrganizations);
        
        // Set current organization if in organization mode
        if (userType === 'organization') {
          if (allOrganizations.length > 0 && !currentOrganization) {
            setCurrentOrganization(allOrganizations[0]);
          } else if (currentOrganization) {
            // Update current organization if it still exists
            const stillExists = allOrganizations.some(org => org.id === currentOrganization.id);
            if (!stillExists) {
              setCurrentOrganization(allOrganizations.length > 0 ? allOrganizations[0] : null);
            } else {
              const updatedOrg = allOrganizations.find(org => org.id === currentOrganization.id);
              if (updatedOrg) {
                setCurrentOrganization(updatedOrg);
              }
            }
          }
        }
      } else if (userRole === 'admin' && userOrgId) {
        // Admin can only see their organization, get details using the orgId from currentUser
        try {
          const userOrg = await getOrganization(userOrgId);
          
          // Set as both the list and current organization
          setOrganizations(userOrg ? [userOrg] : []);
          
          if (userType === 'organization') {
            setCurrentOrganization(userOrg);
          }
        } catch (err) {
          console.error('Error fetching organization details:', err);
          setOrganizations([]);
          setCurrentOrganization(null);
        }
      } else {
        // Regular user - no organization access
        setOrganizations([]);
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

  // Fetch organizations when user or userType changes
  useEffect(() => {
    fetchOrganizations();
  }, [currentUser, userType]);

  const refreshOrganizations = async () => {
    await fetchOrganizations();
  };

  const clearError = () => {
    setError(null);
  };

  // Debug log to check userType
  useEffect(() => {
    console.log('Current userType:', userType);
    console.log('Current organizations:', organizations);
    console.log('Current organization:', currentOrganization);
  }, [userType, organizations, currentOrganization]);

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