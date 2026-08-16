// src/components/layout/AdminHeader.tsx
import React from "react";
import { User } from "../../types/User";
import { useNavigation } from "../../contexts/NavigationContext";

interface AdminHeaderProps {
  onSidebarToggle: () => void;
  user: User | null;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onSidebarToggle }) => {
  const { activeItem } = useNavigation();

  return (
    <header className="flex-shrink-0 relative h-16 shadow md:hidden">
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
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;