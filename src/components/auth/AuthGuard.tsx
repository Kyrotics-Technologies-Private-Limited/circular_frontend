// // src/components/auth/AuthGuard.tsx
// import React from 'react';
// import { Navigate, Outlet, useLocation } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';

// const AuthGuard: React.FC = () => {
//   const { currentUser, loading } = useAuth();
//   const location = useLocation();

//   if (loading) {
//     return (
//       <div className="flex h-screen justify-center items-center">
//         <div className="spinner">Loading...</div>
//       </div>
//     );
//   }

//   if (!currentUser) {
//     // Redirect to login but save the current location
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // If user is authenticated, render the child routes
//   return <Outlet />;
// };

// export default AuthGuard;

// src/components/auth/AuthGuard.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AuthGuard: React.FC = () => {
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
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for pending organizational users
  if (
    currentUser.userType === "organization" &&
    currentUser.status === "pending"
  ) {
    // Don't redirect if already on the pending page
    if (location.pathname !== "/pending-approval") {
      return <Navigate to="/pending-approval" replace />;
    }
  }

  // If user is authenticated and not pending or already on the pending page, render the child routes
  return <Outlet />;
};

export default AuthGuard;
