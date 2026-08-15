// src/components/files/FolderCreate.tsx
import React, { useState } from 'react';
import { createFolder } from '../../services/file.service';
import { useOrganization } from '../../contexts/OrganizationContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FolderPlus } from 'lucide-react';

interface FolderCreateProps {
  organizationId?: string;
  parentFolderId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FolderCreate: React.FC<FolderCreateProps> = ({
  organizationId: propOrgId,
  parentFolderId,
  onSuccess,
  onCancel
}) => {
  const { userType, currentOrganization } = useOrganization();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const organizationId = propOrgId || (userType === 'organization' ? currentOrganization?.id : undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Folder name is required');
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
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
          <FolderPlus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Create New Folder</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {userType === 'organization' && currentOrganization
              ? `Create a new folder in ${currentOrganization.name}`
              : 'Create a new folder in your personal space'}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4">
          <div className="flex">
            <div className="ml-1">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="folder-name" className="block text-sm font-medium text-foreground mb-1.5">
            Folder Name
          </label>
          <Input
            type="text"
            id="folder-name"
            name="folderName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter folder name"
            required
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? 'Creating...' : 'Create Folder'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FolderCreate;
