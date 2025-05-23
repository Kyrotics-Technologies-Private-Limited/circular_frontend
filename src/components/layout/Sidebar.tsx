// src/components/layout/Sidebar.tsx
import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';

interface SidebarProps {
  onClose: () => void;
  showOrgManagement?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, showOrgManagement = false }) => {
  const { currentUser } = useAuth();
  const { setActiveItem } = useNavigation();
  const location = useLocation();
  
  // Define navigation items
  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Directory', path: '/files', icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2' },
    { name: 'Shared Directory', path: '/shared', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
    // Only show Organizations to super admins
    ...(showOrgManagement ? [
      { name: 'Organizations', path: '/organizations', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' }
    ] : []),
    
    { name: 'Profile', path: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
  ];
  
  // If user is admin or super admin, add admin dashboard link
  if (currentUser?.role === 'admin' || currentUser?.role === 'super_admin') {
    navigation.push({ 
      name: 'Admin Panel', 
      path: '/admin/dashboard', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' 
    });
  }

  // Update active item when route changes
  useEffect(() => {
    const currentPath = location.pathname;
    const activeNav = navigation.find(item => 
      currentPath === item.path || currentPath.startsWith(item.path + '/')
    );
    
    if (activeNav) {
      setActiveItem(activeNav.name);
    }
  }, [location.pathname, navigation, setActiveItem]);
  
  return (
    <div className="h-full flex flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-gray-200">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="ml-2 text-lg font-semibold text-gray-900">Circular</span>
        </div>
        <button
          type="button"
          className="md:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={onClose}
        >
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
            onClick={() => {
              setActiveItem(item.name);
              onClose();
            }}
          >
            <svg
              className="mr-3 flex-shrink-0 h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      {/* User Info */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
            {currentUser?.name?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentUser?.email}
            </p>
            {currentUser?.role !== 'user' && (
              <p className="text-xs text-indigo-600 font-medium">
                {currentUser?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;