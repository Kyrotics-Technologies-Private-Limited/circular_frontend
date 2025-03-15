// src/components/files/FolderCreate.tsx
import React, { useState } from 'react';
import { createFolder } from '../../services/file.service';

interface FolderCreateProps {
  organizationId: string;
  parentFolderId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FolderCreate: React.FC<FolderCreateProps> = ({
  organizationId,
  parentFolderId,
  onSuccess,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Folder name is required');
      return;
    }
    
    if (!organizationId) {
      setError('Organization ID is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await createFolder(name, organizationId, parentFolderId || undefined);
      
      setName('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error creating folder:', err);
      setError(err.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Create New Folder
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Enter a name for your new folder.
        </p>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700">
            Folder Name
          </label>
          <input
            type="text"
            id="folder-name"
            name="folderName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            placeholder="Enter folder name"
            required
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? 'Creating...' : 'Create Folder'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FolderCreate;