export interface FileItem {
    id: string;
    name: string;
    path: string;
    type: string;
    size: number;
    url: string;
    organizationId: string;
    folderId: string | null;
    textContent?: string;
    translatedContent?: string;
    targetLanguage?: string;
    uploadedBy: string;
    uploadedAt: Date;
    lastUpdatedAt: Date;
    lastUpdatedBy?: string;
  }
  
  export interface Folder {
    id: string;
    name: string;
    path: string;
    organizationId: string;
    parentFolderId: string | null;
    createdBy: string;
    createdAt: Date;
    lastUpdatedAt: Date;
  }
  
  