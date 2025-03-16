// src/components/auth/RoleGuard.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/User';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user doesn't have the required role, redirect to dashboard
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user has the required role, render the protected routes
  return <Outlet />;
};

export default RoleGuard;