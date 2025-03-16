// src/components/layout/MainLayout.tsx
import React, { ReactNode, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';

interface MainLayoutProps {
  children?: ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}



const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  requireAdmin = false,
  requireSuperAdmin = false 
}) => {
  const { currentUser } = useAuth();
  const { currentOrganization } = useOrganization();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Role-based access control
  if (requireSuperAdmin && currentUser?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAdmin && currentUser?.role !== 'admin' && currentUser?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Determine if user can see organization management
  const canSeeOrgManagement = currentUser?.role === 'super_admin';
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden ${
          sidebarOpen ? 'visible' : 'invisible'
        }`}
      >
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-in-out duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeSidebar}
        ></div>
        
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar 
            onClose={closeSidebar} 
            showOrgManagement={canSeeOrgManagement}
          />
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <Sidebar 
            onClose={() => {}} 
            showOrgManagement={canSeeOrgManagement}
          />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header
          onSidebarToggle={toggleSidebar}
          user={currentUser}
          organization={currentOrganization}
          showAdminLink={currentUser?.role === 'admin' || currentUser?.role === 'super_admin'}
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;