// src/components/auth/RoleBasedRedirect.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RoleBasedRedirectProps {
  userRedirect: string;
  adminRedirect: string;
  superAdminRedirect: string;
}

const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({
  userRedirect,
  adminRedirect,
  superAdminRedirect
}) => {
  const { currentUser, loading } = useAuth();
  // console.log('RoleBasedRedirect:', currentUser);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser.role === 'super_admin') {
    return <Navigate to={superAdminRedirect} replace />;
  }
  
  if (currentUser.role === 'admin') {
    return <Navigate to={adminRedirect} replace />;
  }
  
  return <Navigate to={userRedirect} replace />;
};

export default RoleBasedRedirect;