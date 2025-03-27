// // // src/contexts/OrganizationContext.tsx

// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
//   useCallback,
//   useRef,
// } from "react";
// import { Organization } from "../types/Organization";
// import { useAuth } from "./AuthContext";
// import { UserType } from "../types/User";
// import { getOrganizationbyId } from "../services/organization.service";

// interface OrganizationContextType {
//   currentOrganization: Organization | null;
//   userType: UserType;
//   loading: boolean;
//   error: string | null;
//   clearError: () => void;
// }

// const OrganizationContext = createContext<OrganizationContextType | undefined>(
//   undefined
// );

// export const useOrganization = (): OrganizationContextType => {
//   const context = useContext(OrganizationContext);
//   if (!context) {
//     throw new Error(
//       "useOrganization must be used within an OrganizationProvider"
//     );
//   }
//   return context;
// };

// interface OrganizationProviderProps {
//   children: ReactNode;
// }

// export const OrganizationProvider = ({
//   children,
// }: OrganizationProviderProps): React.ReactElement => {
//   const { currentUser } = useAuth();
//   const [userType, setUserType] = useState<UserType>(
//     (localStorage.getItem("userType") as UserType) || "individual"
//   );
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [organization, setOrganization] = useState<Organization | null>(null);
  
//   // Ref to track the last fetched orgId
//   const lastFetchedOrgId = useRef<string | null>(null);

//   useEffect(() => {
//     if (!currentUser?.orgId) {
//       console.log("currentUser or orgId not found, skipping fetch.");
//       return;
//     }

//     // If we've already fetched this organization, don't fetch again
//     if (lastFetchedOrgId.current === currentUser.orgId) {
//       // console.log("Organization already fetched for this orgId, skipping fetch.");
//       return;
//     }

//     const getOrganization = async () => {
//       try {
//         setLoading(true);
//         // console.log("Fetching organization for orgId:", currentUser.orgId);
//         const org = await getOrganizationbyId(currentUser?.orgId!);
//         // console.log("Organization fetched:", org);
//         setOrganization(org);
//         lastFetchedOrgId.current = currentUser?.orgId!;
//       } catch (error) {
//         console.error("Error getting organization:", error);
//         setError("Failed to load organization data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     getOrganization();
//   }, [currentUser]);

//   const currentOrganization: Organization | null =
//     userType === "organization" && organization ? organization : null;

//     console.log("Current Organization:", currentOrganization);

//   const handleSetUserType = (type: UserType) => {
//     localStorage.setItem("userType", type);
//     setUserType(type);
//   };

//   const value = {
//     currentOrganization,
//     userType,
//     loading,
//     error,
//     setUserType: handleSetUserType,
//     clearError: () => setError(null),
//   };

//   return (
//     <OrganizationContext.Provider value={value}>
//       {children}
//     </OrganizationContext.Provider>
//   );
// };



import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { Organization } from "../types/Organization";
import { useAuth } from "./AuthContext";
import { UserType } from "../types/User";
import { getOrganizationbyId } from "../services/organization.service";

interface OrganizationContextType {
  currentOrganization: Organization | null;
  userType: UserType;
  loading: boolean;
  error: string | null;
  setUserType: (type: UserType) => void;
  clearError: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider = ({
  children,
}: OrganizationProviderProps): React.ReactElement => {
  const { currentUser } = useAuth();
  const [userType, setUserType] = useState<UserType>(
    (localStorage.getItem("userType") as UserType) || "individual"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  
  // Ref to track the last fetched orgId
  const lastFetchedOrgId = useRef<string | null>(null);
  

  useEffect(() => {
    if (!currentUser?.orgId) {
      console.log("currentUser or orgId not found, skipping fetch.");
      return;
    }


    // If we've already fetched this organization, don't fetch again
    if (lastFetchedOrgId.current === currentUser.orgId) {
      // console.log("Organization already fetched for this orgId, skipping fetch.");
      return;
    }

    const getOrganization = async () => {
      try {
        setLoading(true);
        // console.log("Fetching organization for orgId:", currentUser.orgId);
        const org = await getOrganizationbyId(currentUser?.orgId!);
        // console.log("Organization fetched:", org);
        setOrganization(org);
        
        // If we're in an organization context, make sure userType is set correctly
        if (org && userType !== "organization") {
          // console.log("Setting userType to organization");
          handleSetUserType("organization");
        }
        
        lastFetchedOrgId.current = currentUser?.orgId!;
      } catch (error) {
        console.error("Error getting organization:", error);
        setError("Failed to load organization data.");
      } finally {
        setLoading(false);
      }
    };

    getOrganization();
  }, [currentUser]);

  // Make organization available regardless of userType
  // This is the key change - we're not conditioning on userType anymore
  const currentOrganization: Organization | null = organization;
  
  // console.log("Current Organization:", currentOrganization);
  // console.log("Current userType:", userType);

  const handleSetUserType = (type: UserType) => {
    localStorage.setItem("userType", type);
    setUserType(type);
  };

  const value = {
    currentOrganization,
    userType,
    loading,
    error,
    setUserType: handleSetUserType,
    clearError: () => setError(null),
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};