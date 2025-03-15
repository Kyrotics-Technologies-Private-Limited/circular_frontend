// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFound: React.FC = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            404
          </h2>
          <p className="mt-2 text-center text-3xl font-bold text-gray-900">
            Page not found
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            The page you're looking for doesn't exist or you don't have permission to access it.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Link
            to={currentUser ? '/dashboard' : '/'}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to {currentUser ? 'Dashboard' : 'Home'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;