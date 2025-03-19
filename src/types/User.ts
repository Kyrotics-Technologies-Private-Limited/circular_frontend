// src/types/User.ts
export type UserRole = 'user' | 'admin' | 'super_admin';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface User {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  organizations: string[];
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLogin: Date;
}