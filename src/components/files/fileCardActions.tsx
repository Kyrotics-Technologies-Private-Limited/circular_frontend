// src/components/files/fileCardActions.tsx
import React, { useState, useRef } from 'react';
import { FileItem, Folder } from '../../types/File';
import ShareModal from '../shared/shareModal';
import RenameModal from './RenameModal';
import { useOrganization } from '../../contexts/OrganizationContext';
import { deleteFile } from '../../services/file.service';
import { DropdownMenu } from '../ui/dropdownMenu';
import { MoreVertical, Share2, Pencil, Trash2 } from 'lucide-react';

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
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleActionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActionsOpen(!actionsOpen);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActionsOpen(false);
    setShareModalOpen(true);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActionsOpen(false);
    setRenameModalOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setActionsOpen(false);

    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      if (onDelete) {
        onDelete();
      } else {
        setIsDeleting(true);
        try {
          if (type === 'file') {
            await deleteFile(item.id);
          }
          onSuccess();
        } catch (error) {
          console.error(`Error deleting ${type}:`, error);
          alert(`Failed to delete ${type}. Please try again.`);
        } finally {
          setIsDeleting(false);
        }
      }
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleActionToggle}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        disabled={isDeleting}
        aria-label={`Actions for ${item.name}`}
        aria-haspopup="menu"
        aria-expanded={actionsOpen}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <DropdownMenu
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        triggerRef={triggerRef}
        align="end"
        className="w-44"
      >
        <button
          onClick={handleShareClick}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground rounded-lg hover:bg-muted transition-colors"
          role="menuitem"
        >
          <Share2 className="h-4 w-4 text-muted-foreground" />
          Share
        </button>

        {type === 'file' && (
          <button
            onClick={handleRenameClick}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground rounded-lg hover:bg-muted transition-colors"
            role="menuitem"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
            Rename
          </button>
        )}

        <button
          onClick={handleDeleteClick}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          role="menuitem"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </DropdownMenu>

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

      {renameModalOpen && type === 'file' && (
        <RenameModal
          isOpen={renameModalOpen}
          onClose={() => setRenameModalOpen(false)}
          file={item as FileItem}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};

export default FileCardActions;
