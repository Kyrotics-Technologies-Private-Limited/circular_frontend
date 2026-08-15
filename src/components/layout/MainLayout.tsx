// src/components/layout/MainLayout.tsx
import React, { useState, ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationProvider } from '../../contexts/NavigationContext';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isTranslationPage = location.pathname.includes('/translation/');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const showAdminLink = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const showOrgManagement = currentUser?.role === 'super_admin';

  return (
    <NavigationProvider>
      <div className="h-screen flex overflow-hidden bg-background">
        {/* Mobile sidebar */}
        <div
          className={`fixed inset-0 flex z-40 md:hidden ${
            sidebarOpen ? 'visible' : 'invisible'
          }`}
        >
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity ease-in-out duration-300 ${
              sidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeSidebar}
          ></div>

          <div
            className={`relative flex-1 flex flex-col max-w-xs w-full bg-card transform transition ease-in-out duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar onClose={closeSidebar} showOrgManagement={showOrgManagement} />
          </div>
        </div>

        {/* Desktop sidebar */}
        {!isTranslationPage && (
          <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
              <Sidebar onClose={() => {}} showOrgManagement={showOrgManagement} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {!isTranslationPage && (
            <Header
              onSidebarToggle={toggleSidebar}
              user={currentUser}
              organization={null}
              showAdminLink={showAdminLink}
            />
          )}

          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-muted/40">
            <div className={isTranslationPage ? "h-full p-3" : "py-6 px-4 sm:px-6 md:px-8 max-w-[1600px] mx-auto w-full"}>
              {children ? children : <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </NavigationProvider>
  );
};

export default MainLayout;
