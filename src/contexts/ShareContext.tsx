// src/contexts/ShareContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { FileItem, Folder } from '../types/File';
import { getSharedWithMe } from '../services/share.service';

interface ShareContextType {
  sharedFiles: FileItem[];
  sharedFolders: Folder[];
  loadingShared: boolean;
  errorShared: string | null;
  refreshSharedItems: () => Promise<void>;
}

const ShareContext = createContext<ShareContextType | undefined>(undefined);

interface ShareProviderProps {
  children: ReactNode;
}

export const ShareProvider: React.FC<ShareProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [sharedFiles, setSharedFiles] = useState<FileItem[]>([]);
  const [sharedFolders, setSharedFolders] = useState<Folder[]>([]);
  const [loadingShared, setLoadingShared] = useState<boolean>(false);
  const [errorShared, setErrorShared] = useState<string | null>(null);

  const refreshSharedItems = async () => {
    if (!currentUser) return;

    setLoadingShared(true);
    setErrorShared(null);

    try {
      const response = await getSharedWithMe();
      
      if (response.success) {
        setSharedFiles(response.files || []);
        setSharedFolders(response.folders || []);
      } else {
        setErrorShared(response.message || 'Failed to load shared items');
      }
    } catch (error: any) {
      console.error('Error fetching shared items:', error);
      setErrorShared(error.message || 'An error occurred while fetching shared items');
    } finally {
      setLoadingShared(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshSharedItems();
    }
  }, [currentUser]);

  const value = {
    sharedFiles,
    sharedFolders,
    loadingShared,
    errorShared,
    refreshSharedItems
  };

  return <ShareContext.Provider value={value}>{children}</ShareContext.Provider>;
};

export const useShare = (): ShareContextType => {
  const context = useContext(ShareContext);
  if (context === undefined) {
    throw new Error('useShare must be used within a ShareProvider');
  }
  return context;
};