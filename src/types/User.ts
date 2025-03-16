// src/types/User.ts
export type UserRole = 'user' | 'admin' | 'super_admin';

export interface User {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  organizations: string[];
  role: UserRole;
  createdAt: Date;
  lastLogin: Date;
}