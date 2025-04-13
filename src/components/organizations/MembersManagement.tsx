// src/components/organizations/MembersManagement.tsx
import React, { useState, useEffect } from "react";
import {
  // getOrganizationbyId,
  addOrganizationUser,
  removeOrganizationUser,
  getOrganizationUsers,
} from "../../services/organization.service";
import { useAuth } from "../../contexts/AuthContext";
import { User } from "../../types/User";

interface MembersManagementProps {
  organizationId: string;
  isAdmin: boolean;
}

interface Member {
  id: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
}

const MembersManagement: React.FC<MembersManagementProps> = ({
  organizationId,
  isAdmin,
}) => {
  const { currentUser } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch organization members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!organizationId) return;

      try {
        setLoading(true);
        setError(null);

        const users = await getOrganizationUsers(organizationId);

        // Convert users to Member objects
        const memberData: Member[] = users.map((user: User) => ({
          id: user.uid,
          displayName: user.name || user.email,
          email: user.email,
          isAdmin: user.role === "admin",
        }));

        setMembers(memberData);
      } catch (err: any) {
        console.error("Error fetching members:", err);
        setError(err.message || "Failed to load organization members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [organizationId, currentUser]);

  // Handle add member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setAdding(true);
      setError(null);
      setSuccessMessage(null);

      await addOrganizationUser(organizationId, { email, role });

      // Refetch members
      const users = await getOrganizationUsers(organizationId);
      const memberData: Member[] = users.map((user: User) => ({
        id: user.uid,
        displayName: user.name || user.email,
        email: user.email,
        isAdmin: user.role === "admin",
      }));

      setMembers(memberData);
      setEmail("");
      setRole("user");
      setSuccessMessage("Member added successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error("Error adding member:", err);
      setError(err.message || "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (memberId: string) => {
    if (!memberId) return;

    try {
      setRemoving(memberId);
      setError(null);
      setSuccessMessage(null);

      await removeOrganizationUser(organizationId, memberId);

      // Refetch members
      const users = await getOrganizationUsers(organizationId);
      const memberData: Member[] = users.map((user: User) => ({
        id: user.uid,
        displayName: user.name || user.email,
        email: user.email,
        isAdmin: user.role === "admin",
      }));

      setMembers(memberData);
      setSuccessMessage("Member removed successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error("Error removing member:", err);
      setError(err.message || "Failed to remove member");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Organization Members
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Manage members and their roles within this organization.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 sm:px-6">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="px-4 py-3 sm:px-6">
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  {successMessage}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Form - Only visible to admins */}
      {isAdmin && (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="sm:flex sm:items-center sm:space-x-4">
              <div className="sm:w-1/2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter member's email"
                  required
                />
              </div>

              <div className="mt-4 sm:mt-0">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "user" | "admin")}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="user">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mt-4 sm:mt-0 sm:flex-shrink-0 sm:flex sm:items-end">
                <button
                  type="submit"
                  disabled={adding}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {adding ? "Adding..." : "Add Member"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Members List */}
      <div className="border-t border-gray-200">
        {loading ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="spinner">Loading...</div>
          </div>
        ) : members.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {members.map((member) => (
              <li
                key={member.id}
                className="px-4 py-4 sm:px-6 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-700 font-medium">
                      {member.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {member.displayName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.isAdmin ? "Admin" : "Member"}
                    </div>
                  </div>
                </div>

                {isAdmin && member.id !== currentUser?.uid && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={removing === member.id}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {removing === member.id ? "Removing..." : "Remove"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-sm text-gray-500">No members found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersManagement;
