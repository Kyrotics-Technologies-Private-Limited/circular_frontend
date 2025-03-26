// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../../types/User';
import { Organization } from '../../types/Organization';
import { logoutUser } from '../../services/auth.service';
import { useOrganization } from '../../contexts/OrganizationContext';

interface HeaderProps {
  onSidebarToggle: () => void;
  user: User | null;
  organization: Organization | null;
  showAdminLink?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onSidebarToggle, 
  user, 
  showAdminLink = false
}) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const { currentOrganization } = useOrganization();
  
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    if (showOrgMenu) setShowOrgMenu(false);
  };
  
  const toggleOrgMenu = () => {
    setShowOrgMenu(!showOrgMenu);
    if (showProfileMenu) setShowProfileMenu(false);
  };
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  

  
  return (
    <header className="flex-shrink-0 z-1 relative h-16 bg-white shadow">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        <div className="flex items-center">
          <button
            type="button"
            className="p-1 rounded-md text-gray-400 md:hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onSidebarToggle}
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="ml-4 md:ml-0">
            <h1 className="text-lg font-semibold text-gray-900">File Translation System</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Organization Selector */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-2 text-sm rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
              onClick={toggleOrgMenu}
            >
              <span className="font-medium ">{currentOrganization?.name || 'Select Organization'}</span>
              {/* <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg> */}
            </button>
            
           
          </div>
          
          {/* Admin Link (if user is admin or super admin) */}
          {showAdminLink && (
            <Link
              to="/admin/dashboard"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
            >
              Admin Panel
            </Link>
          )}
          
          {/* Profile Menu */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={toggleProfileMenu}
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </button>
            
            {showProfileMenu && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <div className="px-4 py-2 text-sm text-gray-900 border-b border-gray-100">
                    <p className="font-medium">{user?.displayName || 'User'}</p>
                    <p className="text-gray-500 truncate">{user?.email}</p>
                    {user?.role !== 'user' && (
                      <p className="text-indigo-600 font-medium">
                        {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </p>
                    )}
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                    role="menuitem"
                  >
                    Your Profile
                  </Link>
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;