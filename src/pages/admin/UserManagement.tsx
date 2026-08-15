// src/pages/admin/UserManagement.tsx

import React, { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  X,
  Save,
  Check,
  Shield,
  CircleCheckBig,
  Ban,
  AlertCircle,
} from "lucide-react";

import { User, UserRole } from "../../types/User";
import {
  getOrganizationUsers,
  addOrganizationUser,
  removeOrganizationUser,
  updateUserRole,
} from "../../services/organization.service";
import { useOrganization } from "../../contexts/OrganizationContext";
import { disableUser, enableUser } from "../../services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import Loader from "@/components/ui/loader";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "user" as UserRole,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [statusUserId, setStatusUserId] = useState<string | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const { currentOrganization } = useOrganization();
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const organizationId = currentOrganization?.id || "";

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const users = await getOrganizationUsers(organizationId);
        setUsers(users);
        setFilteredUsers(users);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(err.response?.data?.message || "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [organizationId]);

  useEffect(() => {
    let result = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(result);
  }, [searchTerm, users]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({
      email: "",
      name: "",
      role: "user",
    });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      email: user.email,
      name: user.name || "",
      role: user.role,
    });
    setShowModal(true);
  };

  const handleAddUser = async () => {
    try {
      setError(null);
      await addOrganizationUser(organizationId, formData);

      setSuccess("User added successfully");

      const users = await getOrganizationUsers(organizationId);
      setUsers(users);

      setShowModal(false);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add user");
    }
  };

  const handleUpdateUserRole = async () => {
    if (!selectedUser) return;

    try {
      setError(null);
      await updateUserRole(organizationId, selectedUser.id, {
        role: formData.role,
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id
            ? { ...user, role: formData.role as UserRole }
            : user
        )
      );

      setSuccess("User role updated successfully");

      setShowModal(false);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user role");
    }
  };

  const confirmRemoveUser = (userId: string) => {
    setDeleteUserId(userId);
    setShowDeleteConfirm(true);
  };

  const handleRemoveUser = async () => {
    if (!deleteUserId) return;

    try {
      setError(null);
      await removeOrganizationUser(organizationId, deleteUserId);

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== deleteUserId)
      );

      setSuccess("User removed from organization successfully");

      setShowDeleteConfirm(false);
      setDeleteUserId(null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove user");
      setShowDeleteConfirm(false);
    }
  };

  const confirmToggleUserStatus = (
    userId: string,
    isCurrentlyDisabled: boolean
  ) => {
    setStatusUserId(userId);
    setIsDisabling(!isCurrentlyDisabled);
    setShowStatusConfirm(true);
  };

  const handleToggleUserStatus = async () => {
    if (!statusUserId) return;

    try {
      setError(null);
      setIsStatusLoading(true);

      if (isDisabling) {
        await disableUser(statusUserId);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === statusUserId ? { ...user, disabled: true } : user
          )
        );
        setSuccess("User disabled successfully");
      } else {
        await enableUser(statusUserId);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === statusUserId ? { ...user, disabled: false } : user
          )
        );
        setSuccess("User enabled successfully");
      }

      setShowStatusConfirm(false);
      setStatusUserId(null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          `Failed to ${isDisabling ? "disable" : "enable"} user`
      );
    } finally {
      setIsStatusLoading(false);
      setShowStatusConfirm(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="secondary" className="gap-1.5">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "user":
        return (
          <Badge variant="info" className="gap-1.5">
            User
          </Badge>
        );
      case "super_admin":
        return (
          <Badge variant="destructive" className="gap-1.5">
            <Shield className="h-3 w-3" />
            Super Admin
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (disabled: boolean | undefined) => {
    if (disabled) {
      return (
        <Badge variant="destructive" className="gap-1.5">
          <CircleCheckBig className="h-3 w-3" />
          Disabled
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="gap-1.5">
        <CircleCheckBig className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const actionButtonClass =
    "h-8 w-8 p-0 rounded-lg inline-flex items-center justify-center";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Manage Organization Users
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add, edit, and manage users within your organization
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <h3 className="text-sm font-medium text-red-800 ml-2">{error}</h3>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-green-50 p-4">
          <div className="flex items-start">
            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <h3 className="text-sm font-medium text-green-800 ml-2">
              {success}
            </h3>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-400 hover:text-green-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 flex flex-wrap justify-between items-center gap-3 border-b border-border">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={openAddModal}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr>
                  {["User", "Role", "Status", "Joined", "Last Login", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-muted/40 transition-colors ${
                      user.disabled ? "bg-muted/20" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                          {(user.name || user.email)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-foreground">
                            {user.name || "—"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.disabled)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {user.createdAt ? formatDate(user.createdAt) : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {user.lastLogin ? formatDate(user.lastLogin) : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          onClick={() =>
                            confirmToggleUserStatus(
                              user.id,
                              Boolean(user.disabled)
                            )
                          }
                          variant="outline"
                          className={actionButtonClass}
                          title={user.disabled ? "Enable User" : "Disable User"}
                        >
                          {user.disabled ? (
                            <CircleCheckBig className="h-4 w-4 text-green-600" />
                          ) : (
                            <Ban className="h-4 w-4 text-amber-600" />
                          )}
                        </Button>
                        <Button
                          onClick={() => openEditModal(user)}
                          variant="outline"
                          className={actionButtonClass}
                          title="Edit Role"
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          onClick={() => confirmRemoveUser(user.id)}
                          variant="outline"
                          className={actionButtonClass}
                          title="Remove from Organization"
                          disabled={
                            user.id ===
                              users.find((u) => u.role === "admin")?.id &&
                            users.filter((u) => u.role === "admin").length === 1
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalMode === "add" ? "Add User to Organization" : "Edit User Role"
        }
        description={
          modalMode === "add"
            ? "Invite a new user to your organization"
            : "Change the role assigned to this user"
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={
                modalMode === "add" ? handleAddUser : handleUpdateUserRole
              }
            >
              <Save className="h-4 w-4 mr-1" />
              {modalMode === "add" ? "Add User" : "Update Role"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {modalMode === "add" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Name
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  User Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="user@example.com"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Removal"
        description="Are you sure you want to remove this user from the organization? They will lose access to all organization resources."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveUser}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove User
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          This action cannot be undone.
        </p>
      </Modal>

      <Modal
        open={showStatusConfirm}
        onClose={() => setShowStatusConfirm(false)}
        title={`Confirm ${isDisabling ? "Disable" : "Enable"} User`}
        description={
          isDisabling
            ? "Are you sure you want to disable this user? They will not be able to access the organization until re-enabled."
            : "Are you sure you want to enable this user? They will regain access to the organization."
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowStatusConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleToggleUserStatus}
              disabled={isStatusLoading}
              variant={isDisabling ? "outline" : "default"}
              className={isDisabling ? "text-amber-600 border-amber-300 hover:bg-amber-50" : ""}
            >
              {isStatusLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  {isDisabling ? "Disabling..." : "Enabling..."}
                </>
              ) : (
                <>
                  {isDisabling ? (
                    <Ban className="h-4 w-4 mr-1" />
                  ) : (
                    <CircleCheckBig className="h-4 w-4 mr-1" />
                  )}
                  {isDisabling ? "Disable User" : "Enable User"}
                </>
              )}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          The user&apos;s access will be{" "}
          {isDisabling ? "revoked" : "restored"} immediately.
        </p>
      </Modal>
    </div>
  );
};

export default UserManagement;
