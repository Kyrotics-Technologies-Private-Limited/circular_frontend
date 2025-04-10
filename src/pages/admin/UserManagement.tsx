// // // src/pages/admin/UserManagement.tsx

// import React, { useState, useEffect } from "react";
// import {
//   Search,
//   UserPlus,
//   Edit,
//   Trash2,
//   X,
//   Save,
//   Check,
//   Shield,
// } from "lucide-react";
// // import axios from 'axios';

// import { User, UserRole } from "../../types/User";
// import {
//   getOrganizationUsers,
//   addOrganizationUser,
//   removeOrganizationUser,
//   updateUserRole,
// } from "../../services/organization.service";
// import { useOrganization } from "../../contexts/OrganizationContext";

// const UserManagement: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [modalMode, setModalMode] = useState<"add" | "edit">("add");
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [formData, setFormData] = useState({
//     email: "",
//     role: "user" as UserRole,
//   });
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const { currentOrganization } = useOrganization();
//   const organizationId = currentOrganization?.id || "";
//   console.log(organizationId, "Organization ID from context");
//   console.log(currentOrganization, "Current Organization from context");

//   // Fetch organization users
//   useEffect(() => {
//     const fetchUsers = async () => {
//       setIsLoading(true);
//       try {
//         const users = await getOrganizationUsers(organizationId);
//         // console.log('Fetched users:', users);
//         setUsers(users);
//         setFilteredUsers(users);
//         setError(null);
//       } catch (err: any) {
//         console.error("Error fetching users:", err);
//         setError(err.response?.data?.message || "Failed to load users");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchUsers();
//   }, [organizationId]);

//   useEffect(() => {
//     // Filter and search logic
//     let result = [...users];

//     // Apply search term
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter(
//         (user) =>
//           user.name?.toLowerCase().includes(term) ||
//           user.email.toLowerCase().includes(term)
//       );
//     }

//     setFilteredUsers(result);
//   }, [searchTerm, users]);

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const openAddModal = () => {
//     setModalMode("add");
//     setFormData({
//       email: "",
//       role: "user",
//     });
//     setShowModal(true);
//   };

//   const openEditModal = (user: User) => {
//     setModalMode("edit");
//     setSelectedUser(user);
//     setFormData({
//       email: user.email,
//       role: user.role,
//     });
//     setShowModal(true);
//   };

//   const handleAddUser = async () => {
//     try {
//       setError(null);
//       await addOrganizationUser(organizationId, formData);

//       // Show success message
//       setSuccess("User added successfully");

//       // Refresh user list
//       const users = await getOrganizationUsers(organizationId);
//       setUsers(users);

//       setShowModal(false);

//       // Clear success message after 3 seconds
//       setTimeout(() => setSuccess(null), 3000);
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Failed to add user");
//     }
//   };

//   const handleUpdateUserRole = async () => {
//     if (!selectedUser) return;

//     try {
//       setError(null);
//       await updateUserRole(organizationId, selectedUser.id, {
//         role: formData.role,
//       });

//       // Update local state
//       setUsers((prevUsers) =>
//         prevUsers.map((user) =>
//           user.id === selectedUser.id
//             ? { ...user, role: formData.role as UserRole }
//             : user
//         )
//       );

//       // Show success message
//       setSuccess("User role updated successfully");

//       setShowModal(false);

//       // Clear success message after 3 seconds
//       setTimeout(() => setSuccess(null), 3000);
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Failed to update user role");
//     }
//   };

//   const confirmRemoveUser = (userId: string) => {
//     setDeleteUserId(userId);
//     setShowDeleteConfirm(true);
//   };

//   const handleRemoveUser = async () => {
//     if (!deleteUserId) return;

//     try {
//       setError(null);
//       await removeOrganizationUser(organizationId, deleteUserId);

//       // Update local state
//       setUsers((prevUsers) =>
//         prevUsers.filter((user) => user.id !== deleteUserId)
//       );

//       // Show success message
//       setSuccess("User removed from organization successfully");

//       setShowDeleteConfirm(false);
//       setDeleteUserId(null);

//       // Clear success message after 3 seconds
//       setTimeout(() => setSuccess(null), 3000);
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Failed to remove user");
//       setShowDeleteConfirm(false);
//     }
//   };

//   // Get role badge
//   const getRoleBadge = (role: UserRole) => {
//     switch (role) {
//       case "admin":
//         return (
//           <span className="flex items-center px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
//             <Shield className="h-3 w-3 mr-1" />
//             Admin
//           </span>
//         );
//       case "user":
//         return (
//           <span className="flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
//             User
//           </span>
//         );
//       case "super_admin":
//         return (
//           <span className="flex items-center px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
//             <Shield className="h-3 w-3 mr-1" />
//             Super Admin
//           </span>
//         );
//       default:
//         return (
//           <span className="flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
//             {role}
//           </span>
//         );
//     }
//   };

//   // Format date
//   const formatDate = (date: Date) => {
//     return new Intl.DateTimeFormat("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     }).format(new Date(date));
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">
//           Manage Organization Users
//         </h1>
//         <Button
//           onClick={openAddModal}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
//         >
//           <UserPlus className="h-5 w-5 mr-1" />
//           Add User
//         </Button>
//       </div>

//       {/* Error message */}
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
//           <span>{error}</span>
//           <Button onClick={() => setError(null)}>
//             <X className="h-5 w-5" />
//           </Button>
//         </div>
//       )}

//       {/* Success message */}
//       {success && (
//         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
//           <span className="flex items-center">
//             <Check className="h-5 w-5 mr-1" />
//             {success}
//           </span>
//           <Button onClick={() => setSuccess(null)}>
//             <X className="h-5 w-5" />
//           </Button>
//         </div>
//       )}

//       {/* Search */}
//       <div className="relative mb-6">
//         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//           <Search className="h-5 w-5 text-gray-400" />
//         </div>
//         <input
//           type="text"
//           placeholder="Search users..."
//           className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {/* Table */}
//       {isLoading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       ) : filteredUsers.length === 0 ? (
//         <div className="text-center py-10 text-gray-600">No users found</div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   User
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   Role
//                 </th>

//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   Joined
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   Last Login
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredUsers.map((user) => (
//                 <tr key={user.id}>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">
//                           {user.name}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           {user.email}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {getRoleBadge(user.role)}
//                   </td>

//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {formatDate(user.createdAt)}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {formatDate(user.lastLogin)}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <div className="flex justify-end space-x-2">
//                       <Button
//                         onClick={() => openEditModal(user)}
//                         className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded"
//                         title="Edit Role"
//                       >
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         onClick={() => confirmRemoveUser(user.id)}
//                         className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded"
//                         title="Remove from Organization"
//                         disabled={
//                           user.id ===
//                             users.find((u) => u.role === "admin")?.id &&
//                           users.filter((u) => u.role === "admin").length === 1
//                         }
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Add/Edit User Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-gray-500/40 backdrop-blur-[3px] flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md z-100">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold text-gray-800">
//                 {modalMode === "add"
//                   ? "Add User to Organization"
//                   : "Edit User Role"}
//               </h2>
//               <Button
//                 onClick={() => setShowModal(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="h-6 w-6" />
//               </Button>
//             </div>

//             <div className="space-y-4">
//               {modalMode === "add" && (
//                 <div>
//                   <label className="block text-gray-700 text-sm font-medium mb-1">
//                     User Email
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="user@example.com"
//                   />
//                 </div>
//               )}

//               <div>
//                 <label className="block text-gray-700 text-sm font-medium mb-1">
//                   Role
//                 </label>
//                 <select
//                   name="role"
//                   value={formData.role}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="user">User</option>
//                   <option value="admin">Admin</option>
//                 </select>
//               </div>
//             </div>

//             <div className="mt-6 flex justify-end space-x-3">
//               <Button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={
//                   modalMode === "add" ? handleAddUser : handleUpdateUserRole
//                 }
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
//               >
//                 <Save className="h-4 w-4 mr-1" />
//                 {modalMode === "add" ? "Add User" : "Update Role"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Remove User Confirmation Modal */}
//       {showDeleteConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <div className="mb-4">
//               <h2 className="text-xl font-semibold text-gray-800">
//                 Confirm Removal
//               </h2>
//               <p className="text-gray-600 mt-2">
//                 Are you sure you want to remove this user from the organization?
//                 They will lose access to all organization resources.
//               </p>
//             </div>

//             <div className="flex justify-end space-x-3">
//               <Button
//                 onClick={() => setShowDeleteConfirm(false)}
//                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleRemoveUser}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
//               >
//                 <Trash2 className="h-4 w-4 mr-1" />
//                 Remove User
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement;

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
} from "lucide-react";
// import axios from 'axios';

import { User, UserRole } from "../../types/User";
import {
  getOrganizationUsers,
  addOrganizationUser,
  removeOrganizationUser,
  updateUserRole,
} from "../../services/organization.service";
import { useOrganization } from "../../contexts/OrganizationContext";
import { disableUser, enableUser } from "../../services/auth.service";
import { Button } from "@/components/ui/button"


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
  // console.log(organizationId, "Organization ID from context");
  // console.log(currentOrganization, "Current Organization from context");

  // Fetch organization users
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

  console.log('Fetched users:', users);


  useEffect(() => {
    // Filter and search logic
    let result = [...users];

    // Apply search term
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

      // Show success message
      setSuccess("User added successfully");

      // Refresh user list
      const users = await getOrganizationUsers(organizationId);
      setUsers(users);

      setShowModal(false);

      // Clear success message after 3 seconds
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

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id
            ? { ...user, role: formData.role as UserRole }
            : user
        )
      );

      // Show success message
      setSuccess("User role updated successfully");

      setShowModal(false);

      // Clear success message after 3 seconds
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

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== deleteUserId)
      );

      // Show success message
      setSuccess("User removed from organization successfully");

      setShowDeleteConfirm(false);
      setDeleteUserId(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove user");
      setShowDeleteConfirm(false);
    }
  };

  // Handle user status toggle confirmation dialog
  const confirmToggleUserStatus = (
    userId: string,
    isCurrentlyDisabled: boolean
  ) => {
    setStatusUserId(userId);
    setIsDisabling(!isCurrentlyDisabled); // If currently disabled, we'll enable them
    setShowStatusConfirm(true);
  };

  // Handle user enable/disable
  // Handle user enable/disable
  const handleToggleUserStatus = async () => {
    if (!statusUserId) return;

    try {
      setError(null);
      setIsStatusLoading(true);
      
      if (isDisabling) {
        await disableUser(statusUserId);
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === statusUserId ? { ...user, disabled: true } : user
          )
        );
        setSuccess("User disabled successfully");
      } else {
        await enableUser(statusUserId);
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === statusUserId ? { ...user, disabled: false } : user
          )
        );
        setSuccess("User enabled successfully");
      }

      setShowStatusConfirm(false);
      setStatusUserId(null);

      // Clear success message after 3 seconds
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

  // Get role badge
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </span>
        );
      case "user":
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            User
          </span>
        );
      case "super_admin":
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            <Shield className="h-3 w-3 mr-1" />
            Super Admin
          </span>
        );
      default:
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            {role}
          </span>
        );
    }
  };

  // Get status badge
  const getStatusBadge = (disabled: boolean | undefined) => {
    if (disabled) {
      return (
        <span className="flex items-center px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
          <CircleCheckBig className="h-3 w-3 mr-1" />
          Disabled
        </span>
      );
    }
    return (
      <span className="flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
        <CircleCheckBig className="h-3 w-3 mr-1" />
        Active
      </span>
    );
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Manage Organization Users
        </h1>
        <Button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <UserPlus className="h-5 w-5 mr-1" />
          Add User
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <Button onClick={() => setError(null)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span className="flex items-center">
            <Check className="h-5 w-5 mr-1" />
            {success}
          </span>
          <Button onClick={() => setSuccess(null)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-10 text-gray-600">No users found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Joined
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Last Login
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={user.disabled ? "bg-gray-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() =>
                          confirmToggleUserStatus(
                            user.id,
                            Boolean(user.disabled)
                          )
                        }
                        className={`${
                          user.disabled
                            ? "bg-green-100 hover:bg-green-200 text-green-700"
                            : "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                        } p-2 rounded`}
                        title={user.disabled ? "Enable User" : "Disable User"}
                      >
                        {user.disabled ? (
                          <CircleCheckBig className="h-4 w-4" />
                        ) : (
                          <Ban className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => openEditModal(user)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded"
                        title="Edit Role"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => confirmRemoveUser(user.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded"
                        title="Remove from Organization"
                        disabled={
                          user.id ===
                            users.find((u) => u.role === "admin")?.id &&
                          users.filter((u) => u.role === "admin").length === 1
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0  backdrop-blur-[3px] flex items-center justify-center z-50">
          <div className=" rounded-lg bg-slate-100 shadow-lg shadow-gray-600 p-6 w-full max-w-md z-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {modalMode === "add"
                  ? "Add User to Organization"
                  : "Edit User Role"}
              </h2>
              <Button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="space-y-4">
              {modalMode === "add" && (
                <>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      User Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={
                  modalMode === "add" ? handleAddUser : handleUpdateUserRole
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                {modalMode === "add" ? "Add User" : "Update Role"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove User Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-[3px] bg-shadow-md flex items-center justify-center z-50">
          <div className="bg-slate-100 shadow-lg shadow-gray-600 rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Removal
              </h2>
              <p className="text-gray-600 mt-2">
                Are you sure you want to remove this user from the organization?
                They will lose access to all organization resources.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemoveUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle User Status Confirmation Modal */}
      {showStatusConfirm && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-100 shadow-lg shadow-gray-600 rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm {isDisabling ? "Disable" : "Enable"} User
              </h2>
              <p className="text-gray-600 mt-2">
                {isDisabling
                  ? "Are you sure you want to disable this user? They will not be able to access the organization until re-enabled."
                  : "Are you sure you want to enable this user? They will regain access to the organization."}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowStatusConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleToggleUserStatus}
                disabled={isStatusLoading}
                className={`px-4 py-2 ${
                  isDisabling
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white rounded-md flex items-center`}
              >
                {isStatusLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
