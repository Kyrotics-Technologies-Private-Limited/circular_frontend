// src/components/layout/AdminHeader.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "../../types/User";
import { logoutUser } from "../../services/auth.service";
import { useNavigation } from "../../contexts/NavigationContext";

interface AdminHeaderProps {
  onSidebarToggle: () => void;
  user: User | null;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onSidebarToggle, user }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { activeItem } = useNavigation();

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Determine if user is super admin
  // const isSuperAdmin = user?.role === "super_admin";

  return (
    <header className="flex-shrink-0 relative h-16  shadow">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        <div className="flex items-center">
          <button
            type="button"
            className="p-1 rounded-md text-gray-500 md:hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-200"
            onClick={onSidebarToggle}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="ml-4 md:ml-0">
            <h1 className="text-lg font-semibold text-gray-900">
            {activeItem}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Profile Menu */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200"
              onClick={toggleProfileMenu}
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                {user?.name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "?"}
              </div>
            </button>

            {showProfileMenu && (
              <div className="origin-top-right z-10  absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <div className="px-4 py-2 text-sm text-gray-900 border-b border-gray-100">
                    <p className="font-medium">{user?.name || "Admin"}</p>
                    <p className="text-gray-500 truncate">{user?.email}</p>
                    <p className="text-gray-700 font-medium">
                      {user?.role === "super_admin" ? "Super Admin" : "Admin"}
                    </p>
                  </div>
                  <Link
                    to="/admin/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowProfileMenu(false)}
                    role="menuitem"
                  >
                    Your Profile
                  </Link>
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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

export default AdminHeader;