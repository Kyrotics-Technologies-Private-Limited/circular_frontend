// src/pages/RejectedPage.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { XCircle } from 'lucide-react';

const RejectedPage: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@example.com?subject=Organization%20Rejection%20Inquiry';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-50 border-b border-red-100 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <XCircle className="text-red-500" size={20} />
          <span className="font-medium text-red-700">Your organization registration has been rejected</span>
        </div>
        <button 
          onClick={logout}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          Sign Out
        </button>
      </div>
      
      {/* Rest of the rejected page UI */}
    </div>
  );
};

export default RejectedPage;