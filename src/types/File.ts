// Define a type for permissions
export type Permission = {
  userId: string;
  access: "view" | "edit" | "owner" | "none";
};

export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  url: string;
  organizationId?: string;
  userId?: string;
  folderId: string | null;
  isShared: boolean;
  isPublic?: boolean;
  textContent?: string;
  translatedContent?: string;
  targetLanguage?: string;
  uploadedBy: string;
  uploadedAt: Date;
  lastUpdatedAt: Date;
  permissions: Permission[];
  lastUpdatedBy?: string;
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
}
