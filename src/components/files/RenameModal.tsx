// src/components/files/RenameModal.tsx
import React, { useState } from 'react';
import { FileItem } from '../../types/File';
import { renameFile } from '../../services/file.service';
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Pencil } from 'lucide-react';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem;
  onSuccess: () => void;
}

const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onClose,
  file,
  onSuccess
}) => {
  const getFileNameWithoutExtension = (filename: string) => {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex === -1 ? filename : filename.substring(0, lastDotIndex);
  };

  const getFileExtension = (filename: string) => {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex === -1 ? '' : filename.substring(lastDotIndex);
  };

  const [newName, setNewName] = useState(getFileNameWithoutExtension(file.name));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      setError('File name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const extension = getFileExtension(file.name);
      const fullNewName = newName + extension;

      await renameFile(file.id, fullNewName);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error renaming file');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Rename File"
      description={`Update the name of "${file.name}"`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="rename-form"
            disabled={isSubmitting || !newName.trim()}
          >
            {isSubmitting ? 'Renaming...' : 'Rename'}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
          <Pencil className="h-5 w-5" />
        </div>
        <form id="rename-form" onSubmit={handleSubmit} className="flex-1">
          <div>
            <label htmlFor="newName" className="block text-sm font-medium text-foreground mb-1.5">
              New File Name
            </label>
            <div className="flex">
              <Input
                type="text"
                name="newName"
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                className="rounded-r-none"
                placeholder="Enter new file name"
              />
              <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-input bg-muted/40 text-sm text-muted-foreground">
                {getFileExtension(file.name)}
              </span>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RenameModal;
