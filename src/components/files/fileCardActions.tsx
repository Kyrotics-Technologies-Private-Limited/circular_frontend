// src/components/files/FileCardActions.tsx
import React, { useState } from 'react';
import { FileItem, Folder } from '../../types/File';
import ShareModal from '../shared/ShareModal';
import { useOrganization } from '../../contexts/OrganizationContext';

interface FileCardActionsProps {
  item: FileItem | Folder;
  type: 'file' | 'folder';
  onSuccess?: () => void;
  onDelete?: () => void;
}

const FileCardActions: React.FC<FileCardActionsProps> = ({
  item,
  type,
  onSuccess = () => {},
  onDelete
}) => {
  const { currentOrganization } = useOrganization();
  const [actionsOpen, setActionsOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleActionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActionsOpen(!actionsOpen);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActionsOpen(false);
    setShareModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={handleActionToggle}
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <svg 
            className="h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {actionsOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                onClick={handleShareClick}
                className="text-left block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                Share
              </button>
              
              {onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="text-left block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  role="menuitem"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {shareModalOpen && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          type={type}
          item={item}
          organizationId={currentOrganization?.id}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};

export default FileCardActions;