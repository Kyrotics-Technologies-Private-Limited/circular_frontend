// Define a type for permissions
export type Permission = {
  userId: string;
  access: "view" | "edit" | "owner" | "none";
};

export interface FileItem {
  id: string;
  name: string;
  originalFilePath: string;
  originalFileUrl: string;
  translatedFilePath?: string;
  translatedFileUrl?: string;
  mimeType: string;
  sizeBytes: number;
  organizationId?: string;
  userId?: string;
  folderId: string | null;
  isShared: boolean;
  isPublic?: boolean;
  targetLanguage?: string;
  translationStatus?: string;
  uploadedBy: string;
  uploadedAt: Date;
  updatedAt: Date;
  permissions: Permission[];
  updatedBy?: string;
  sharedByName?: string;
  sharedAt?: string;
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  organizationId?: string;
  userId?: string;
  parentFolderId: string | null;
  isShared?: boolean;
  isPublic?: boolean;
  createdBy: string;
  createdAt: Date;
  permissions: Permission[];
  lastUpdatedAt: Date;
  sharedByName?: string;
  sharedAt?: string;
}
