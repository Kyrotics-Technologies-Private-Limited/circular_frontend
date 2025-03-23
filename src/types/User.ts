// src/types/User.ts

export type UserRole = 'user' | 'admin' | 'super_admin';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type UserType = 'individual' | 'organization';

export interface User {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  organizations?: string[];  // Optional - may not exist for individual users
  userType: UserType;        // Identifies whether user is individual or org-based
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLogin: Date;
}

// Define organization membership and roles
export type OrgMemberRole = 'member' | 'admin' | 'owner';

export interface OrganizationMembership {
  userId: string;
  organizationId: string;
  role: OrgMemberRole;
  joinedAt: Date;
}

// For user preferences and settings
export interface UserPreferences {
  userId: string;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
  };
  defaultView?: 'list' | 'grid';
}