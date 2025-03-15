import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { FileItem, Folder } from "../types/File";
import { useOrganization } from "./OrganizationContext";
import { getFiles, getFolders } from "../services/file.service";

interface FileContextType {
  files: FileItem[];
  folders: Folder[];
  currentFolder: Folder | null;
  currentPath: Folder[];
  loading: boolean;
  error: string | null;
  setCurrentFolder: (folder: Folder | null) => void;
  refreshFiles: () => Promise<void>;
  navigateToFolder: (folder: Folder | null) => Promise<void>;
  navigateUp: () => Promise<void>;
  clearError: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const useFile = (): FileContextType => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFile must be used within a FileProvider");
  }
  return context;
};

interface FileProviderProps {
  children: ReactNode;
}

export const FileProvider = ({
  children,
}: FileProviderProps): React.ReactElement => {
  const { currentOrganization } = useOrganization();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [currentPath, setCurrentPath] = useState<Folder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add navigation tracking to prevent circular updates
  const isNavigating = useRef(false);
  const navigationId = useRef(0);

  const fetchFilesAndFolders = async () => {
    if (!currentOrganization) {
      setFiles([]);
      setFolders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get files and folders for current organization and folder
      const [filesData, foldersData] = await Promise.all([
        getFiles(currentOrganization.id, currentFolder?.id),
        getFolders(currentOrganization.id, currentFolder?.id),
      ]);

      setFiles(filesData);
      setFolders(foldersData);
      setError(null);
    } catch (err) {
      console.error("Error fetching files and folders:", err);
      setError("Failed to fetch files and folders");
    } finally {
      setLoading(false);
    }
  };

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
        const parentFolders = await getFolders(currentOrganization!.id);
        const parentFolder = parentFolders.find((f) => f.id === currentParent);

        if (parentFolder) {
          path.unshift(parentFolder);
          currentParent = parentFolder.parentFolderId;
        } else {
          break;
        }
      } catch (err) {
        console.error("Error building path:", err);
        break;
      }
    }

    return path;
  };

  // Navigate to a specific folder
  const navigateToFolder = async (folder: Folder | null): Promise<void> => {
    // Prevent concurrent or duplicate navigation
    if (isNavigating.current) {
      return;
    }

    const currentNavId = ++navigationId.current;
    isNavigating.current = true;
    
    try {
      // First update the current folder and path
      setCurrentFolder(folder);

      if (folder) {
        const path = await buildPath(folder);
        setCurrentPath(path);
      } else {
        setCurrentPath([]);
      }

      // Only fetch files if this is still the most recent navigation
      if (currentNavId === navigationId.current) {
        // Manually fetch files instead of relying on the useEffect
        setLoading(true);
        
        if (currentOrganization) {
          try {
            const [filesData, foldersData] = await Promise.all([
              getFiles(currentOrganization.id, folder?.id),
              getFolders(currentOrganization.id, folder?.id),
            ]);
            
            // Check if this is still the most recent navigation
            if (currentNavId === navigationId.current) {
              setFiles(filesData);
              setFolders(foldersData);
              setError(null);
            }
          } catch (err) {
            console.error("Error fetching files and folders:", err);
            setError("Failed to fetch files and folders");
          } finally {
            setLoading(false);
          }
        } else {
          setFiles([]);
          setFolders([]);
          setLoading(false);
        }
      }
    } finally {
      if (currentNavId === navigationId.current) {
        isNavigating.current = false;
      }
    }
  };

  // Navigate up one level
  const navigateUp = async (): Promise<void> => {
    if (!currentFolder) {
      return;
    }

    const parentId = currentFolder.parentFolderId;

    if (parentId) {
      try {
        const parentFolders = await getFolders(currentOrganization!.id);
        const parentFolder = parentFolders.find((f) => f.id === parentId);

        if (parentFolder) {
          await navigateToFolder(parentFolder);
        } else {
          await navigateToFolder(null);
        }
      } catch (err) {
        console.error("Error navigating up:", err);
        setError("Failed to navigate to parent folder");
      }
    } else {
      await navigateToFolder(null);
    }
  };

  // Refresh files and folders
  const refreshFiles = async (): Promise<void> => {
    await fetchFilesAndFolders();
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Fetch files and folders when organization changes (but not when currentFolder changes)
  useEffect(() => {
    fetchFilesAndFolders();
    // Only depend on organization changes, not on folder changes
  }, [currentOrganization]);

  const value = {
    files,
    folders,
    currentFolder,
    currentPath,
    loading,
    error,
    setCurrentFolder,
    refreshFiles,
    navigateToFolder,
    navigateUp,
    clearError,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
};