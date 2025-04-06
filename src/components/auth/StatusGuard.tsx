// src/components/auth/StatusGuard.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface StatusGuardProps {
  requiredStatus: 'pending' | 'approved' | 'rejected';
}

const StatusGuard: React.FC<StatusGuardProps> = ({ requiredStatus }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user doesn't have the required status, redirect appropriately
  if (currentUser.status !== requiredStatus) {
    if (currentUser.status === 'pending') {
      return <Navigate to="/pending-approval" replace />;
    } else if (currentUser.status === 'rejected') {
      return <Navigate to="/rejected" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default StatusGuard;