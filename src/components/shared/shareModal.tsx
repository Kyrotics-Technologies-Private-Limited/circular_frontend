// src/components/shared/shareModal.tsx
import React, { useState, useEffect } from "react";
import {
  getUsersForSharing,
  shareFileWithUsers,
  shareFolderWithUsers,
  getFileAccessList,
  getFolderAccessList,
  updateFilePermission,
  updateFolderPermission,
  removeFileAccess,
  removeFolderAccess,
  generateSharingLink,
  makeFilePublic,
  makeFolderPublic,
  UserForSharing,
  AccessList,
} from "../../services/share.service";
import { useOrganization } from "../../contexts/OrganizationContext";
import { FileItem, Folder } from "../../types/File";
import Loader from "@/components/ui/loader";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Search,
  Trash2,
  Copy,
  Check,
  Link2,
  Users,
  ShieldCheck,
  Crown,
  AlertCircle,
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "file" | "folder";
  item: FileItem | Folder;
  organizationId?: string;
  onSuccess: () => void;
}

const tabClass = (active: boolean) =>
  `py-2.5 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
    active
      ? "border-primary text-primary"
      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
  }`;

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  type,
  item,
  organizationId,
  onSuccess,
}) => {
  const { currentOrganization } = useOrganization();

  const [activeTab, setActiveTab] = useState<"share" | "manage" | "link">(
    "share"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserForSharing[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [permission, setPermission] = useState<"view" | "edit">("view");
  const [includeContents, setIncludeContents] = useState(true);
  const [accessList, setAccessList] = useState<AccessList | null>(null);

  // Link generation states
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [linkExpiration, setLinkExpiration] = useState<number | null>(24); // Default 24 hours
  const [linkCopied, setLinkCopied] = useState(false);

  // Public sharing states
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === "share") {
      fetchUsers();
    }
  }, [isOpen, activeTab, currentOrganization]);

  useEffect(() => {
    if (isOpen && activeTab === "manage") {
      fetchAccessList();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (isOpen && item) {
      setIsPublic(!!item.isPublic);
    }
  }, [isOpen, item]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsersForSharing(currentOrganization?.id);
      if (response) {
        setUsers(response || []);
      } else {
        setError(response.message || "Failed to load users");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessList = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        type === "file"
          ? await getFileAccessList(item.id)
          : await getFolderAccessList(item.id);

      if (response.success) {
        setAccessList(response);
      } else {
        setError(response.message || "Failed to load access list");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user to share with");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response =
        type === "file"
          ? await shareFileWithUsers(item.id, selectedUsers, permission)
          : await shareFolderWithUsers(
              item.id,
              selectedUsers,
              permission,
              includeContents
            );

      if (response.success) {
        setSelectedUsers([]);
        onSuccess();
        setActiveTab("manage"); // Switch to manage tab after sharing
        fetchAccessList(); // Refresh the access list
      } else {
        setError(response.message || "Failed to share");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermission = async (
    userId: string,
    newPermission: "view" | "edit"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response =
        type === "file"
          ? await updateFilePermission(item.id, userId, newPermission)
          : await updateFolderPermission(
              item.id,
              userId,
              newPermission,
              includeContents
            );

      if (response.success) {
        fetchAccessList();
      } else {
        setError(response.message || "Failed to update permission");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccess = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response =
        type === "file"
          ? await removeFileAccess(item.id, userId)
          : await removeFolderAccess(item.id, userId, includeContents);

      if (response.success) {
        fetchAccessList();
      } else {
        setError(response.message || "Failed to remove access");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await generateSharingLink(
        type,
        item.id,
        linkExpiration || undefined
      );

      if (response.success) {
        setGeneratedLink(response.url);
      } else {
        setError(response.message || "Failed to generate link");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleTogglePublic = async () => {
    try {
      setLoading(true);
      setError(null);

      const newPublicState = !isPublic;
      const orgId = organizationId || currentOrganization?.id;

      if (newPublicState && !orgId) {
        setError("Organization ID is required to make an item public");
        setLoading(false);
        return;
      }

      const response =
        type === "file"
          ? await makeFilePublic(item.id, newPublicState, orgId)
          : await makeFolderPublic(
              item.id,
              newPublicState,
              orgId,
              includeContents
            );

      if (response.success) {
        setIsPublic(newPublicState);
        onSuccess();
      } else {
        setError(
          response.message ||
            `Failed to make ${type} ${newPublicState ? "public" : "private"}`
        );
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const footer =
    activeTab === "share" ? (
      <>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleShare}
          disabled={loading || selectedUsers.length === 0}
        >
          {loading ? "Sharing..." : "Share"}
        </Button>
      </>
    ) : (
      <Button variant="outline" onClick={onClose}>
        Close
      </Button>
    );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      title={`Share ${type === "file" ? "File" : "Folder"}: ${item.name}`}
      footer={footer}
    >
      {/* Tab Navigation */}
      <div className="border-b border-border -mt-1 mb-5">
        <nav className="-mb-px flex space-x-8">
          <button onClick={() => setActiveTab("share")} className={tabClass(activeTab === "share")}>
            Share with People
          </button>
          <button onClick={() => setActiveTab("manage")} className={tabClass(activeTab === "manage")}>
            Manage Access
          </button>
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 mb-5">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="ml-2 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Share with People Tab */}
      {activeTab === "share" && (
        <div>
          <div className="mb-4">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Search People
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                name="search"
                id="search"
                className="pl-9"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2 max-h-60 overflow-y-auto border border-border rounded-xl">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-muted-foreground text-center">
                {searchTerm
                  ? "No users match your search"
                  : "No users available"}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <li key={user.id} className="px-4 py-3 hover:bg-muted/50">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([
                              ...selectedUsers,
                              user.id,
                            ]);
                          } else {
                            setSelectedUsers(
                              selectedUsers.filter(
                                (id) => id !== user.id
                              )
                            );
                          }
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-foreground">
                          {user.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                      {user.organizationMember && (
                        <Badge variant="info">
                          <Users className="h-3 w-3 mr-1" />
                          Organization Member
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-foreground mb-2">
              Permission level
            </label>
            <div className="flex space-x-5">
              <label className="flex items-center cursor-pointer">
                <input
                  id="view"
                  name="permission"
                  type="radio"
                  value="view"
                  checked={permission === "view"}
                  onChange={() => setPermission("view")}
                  className="h-4 w-4 text-primary focus:ring-primary border-border"
                />
                <span className="ml-2 block text-sm text-foreground">
                  View only
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  id="edit"
                  name="permission"
                  type="radio"
                  value="edit"
                  checked={permission === "edit"}
                  onChange={() => setPermission("edit")}
                  className="h-4 w-4 text-primary focus:ring-primary border-border"
                />
                <span className="ml-2 block text-sm text-foreground">
                  Edit
                </span>
              </label>
            </div>
          </div>

          {type === "folder" && (
            <div className="mt-4">
              <label className="flex items-center cursor-pointer">
                <input
                  id="include-contents"
                  name="include-contents"
                  type="checkbox"
                  checked={includeContents}
                  onChange={(e) =>
                    setIncludeContents(e.target.checked)
                  }
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                />
                <span className="ml-2 block text-sm text-foreground">
                  Apply to all contents within this folder
                </span>
              </label>
            </div>
          )}

          {/* Organization Public Sharing */}
          {currentOrganization && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Make public within organization
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Anyone in {currentOrganization.name} can access
                    this {type}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePublic}
                  disabled={loading}
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                    isPublic ? "bg-primary" : "bg-muted-foreground/25"
                  }`}
                  aria-label="Make public"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ${
                      isPublic ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manage Access Tab */}
      {activeTab === "manage" && (
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader />
            </div>
          ) : !accessList ? (
            <div className="p-4 text-muted-foreground text-center">
              Failed to load access information
            </div>
          ) : (
            <div>
              {/* Owner */}
              <div className="mb-5">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Owner
                </h4>
                <div className="flex items-center p-3 bg-muted/40 rounded-xl">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                    {accessList.owner.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-foreground">
                      {accessList.owner.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {accessList.owner.email}
                    </div>
                  </div>
                  <Badge>
                    <Crown className="h-3 w-3 mr-1" />
                    Owner
                  </Badge>
                </div>
              </div>

              {/* Shared With */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  People with access ({accessList.sharedWith.length})
                </h4>

                {accessList.sharedWith.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    This {type} hasn't been shared with anyone
                  </p>
                ) : (
                  <ul className="divide-y divide-border border border-border rounded-xl">
                    {accessList.sharedWith.map((user) => (
                      <li
                        key={user.id}
                        className="px-4 py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {user.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <select
                            value={user.permission}
                            onChange={(e) =>
                              handleUpdatePermission(
                                user.id,
                                e.target.value as "view" | "edit"
                              )
                            }
                            disabled={loading}
                            className="h-9 text-sm border border-input rounded-lg px-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="view">View</option>
                            <option value="edit">Edit</option>
                          </select>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleRemoveAccess(user.id)
                            }
                            disabled={loading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9"
                            aria-label={`Remove access for ${user.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Public Status */}
              <div className="mt-6 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    {isPublic
                      ? "Public within organization"
                      : "Not public"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isPublic
                      ? `Anyone in your organization can access this ${type}`
                      : `This ${type} is only accessible to people listed above`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePublic}
                  disabled={loading}
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                    isPublic ? "bg-primary" : "bg-muted-foreground/25"
                  }`}
                  aria-label="Toggle public"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ${
                      isPublic ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Get Link Tab */}
      {activeTab === "link" && (
        <div>
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">
                Create a sharing link
              </h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                Create a link that you can share with anyone to allow them
                to access this {type}.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="expiration"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Link Expiration (hours)
            </label>
            <select
              id="expiration"
              value={linkExpiration?.toString() || ""}
              onChange={(e) =>
                setLinkExpiration(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="h-10 block w-full px-3 text-base border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm"
            >
              <option value="">Never expire</option>
              <option value="24">24 hours</option>
              <option value="72">3 days</option>
              <option value="168">1 week</option>
              <option value="720">30 days</option>
            </select>
          </div>

          {!generatedLink ? (
            <Button
              type="button"
              onClick={handleGenerateLink}
              disabled={loading}
              className="w-full"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              {loading ? "Generating..." : "Generate Link"}
            </Button>
          ) : (
            <div>
              <div className="flex mt-2">
                <Input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="rounded-r-none font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="rounded-l-none"
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {linkExpiration
                  ? `This link will expire in ${linkExpiration} hours.`
                  : "This link will never expire."}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ShareModal;
