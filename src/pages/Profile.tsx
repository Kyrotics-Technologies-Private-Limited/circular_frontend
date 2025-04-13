// // src/pages/Profile.tsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";
// import { logoutUser, updateUserProfile } from "../services/auth.service";
// import { useOrganization } from "../contexts/OrganizationContext";

// const Profile: React.FC = () => {
//   const { currentUser, setCurrentUser } = useAuth();
//   const navigate = useNavigate();
//   console.log("currentUser", currentUser);
//   const [name, setname] = useState(currentUser?.name || "");
//   const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");
//   const [editing, setEditing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);
//   const { currentOrganization } = useOrganization();

//   const handleEdit = () => {
//     setEditing(true);
//   };

//   const handleCancel = () => {
//     setname(currentUser?.name || "");
//     setPhotoURL(currentUser?.photoURL || "");
//     setEditing(false);
//     setError(null);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       setLoading(true);
//       setError(null);
//       setSuccessMessage(null);

//       const updateData: { name?: string; photoURL?: string } = {};

//       if (name !== currentUser?.name) {
//         updateData.name = name;
//       }

//       if (photoURL !== currentUser?.photoURL) {
//         updateData.photoURL = photoURL;
//       }

//       // Only update if there are changes
//       if (Object.keys(updateData).length > 0) {
//         await updateUserProfile(updateData);

//         // Update local user state
//         if (currentUser) {
//           setCurrentUser({
//             ...currentUser,
//             ...updateData,
//           });
//         }

//         setSuccessMessage("Profile updated successfully");

//         // Clear success message after 3 seconds
//         setTimeout(() => {
//           setSuccessMessage(null);
//         }, 3000);
//       }

//       setEditing(false);
//     } catch (err: any) {
//       console.error("Error updating profile:", err);
//       setError(err.message || "Failed to update profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logoutUser();
//       navigate("/login");
//     } catch (err: any) {
//       console.error("Error logging out:", err);
//       setError(err.message || "Failed to log out");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-semibold text-gray-900">Your Profile</h1>
//         <p className="mt-1 text-sm text-gray-500">
//           View and update your account information
//         </p>
//       </div>

//       {error && (
//         <div className="rounded-md bg-red-50 p-4">
//           <div className="flex">
//             <div className="ml-3">
//               <h3 className="text-sm font-medium text-red-800">{error}</h3>
//             </div>
//           </div>
//         </div>
//       )}

//       {successMessage && (
//         <div className="rounded-md bg-green-50 p-4">
//           <div className="flex">
//             <div className="ml-3">
//               <h3 className="text-sm font-medium text-green-800">
//                 {successMessage}
//               </h3>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="bg-white shadow overflow-hidden sm:rounded-lg">
//         <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
//           <div>
//             <h3 className="text-lg leading-6 font-medium text-gray-900">
//               Account Information
//             </h3>
//             <p className="mt-1 max-w-2xl text-sm text-gray-500">
//               Personal details and account settings.
//             </p>
//           </div>
//           {!editing && (
//             <Button
//               type="Button"
//               onClick={handleEdit}
//               className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//             >
//               Edit Profile
//             </Button>
//           )}
//         </div>

//         {editing ? (
//           <div className="border-t border-gray-200">
//             <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
//               <div className="grid grid-cols-1 gap-6">
//                 <div>
//                   <label
//                     htmlFor="email"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     id="email"
//                     value={currentUser?.email || ""}
//                     className="mt-1 bg-gray-100 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//                     disabled
//                   />
//                   <p className="mt-1 text-xs text-gray-500">
//                     Email address cannot be changed.
//                   </p>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="name"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Display Name
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     id="name"
//                     value={name}
//                     onChange={(e) => setname(e.target.value)}
//                     className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//                   />
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="photoURL"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Profile Photo URL
//                   </label>
//                   <input
//                     type="text"
//                     name="photoURL"
//                     id="photoURL"
//                     value={photoURL}
//                     onChange={(e) => setPhotoURL(e.target.value)}
//                     className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//                   />
//                   <p className="mt-1 text-xs text-gray-500">
//                     Enter a URL for your profile picture.
//                   </p>
//                 </div>

//                 <div className="flex justify-end space-x-3">
//                   <Button
//                     type="Button"
//                     onClick={handleCancel}
//                     className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="submit"
//                     disabled={loading}
//                     className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
//                   >
//                     {loading ? "Saving..." : "Save Changes"}
//                   </Button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         ) : (
//           <div className="border-t border-gray-200">
//             <dl>
//               <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//                 <dt className="text-sm font-medium text-gray-500">
//                   Display name
//                 </dt>
//                 <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                   {currentUser?.name || "Not set"}
//                 </dd>
//               </div>
//               <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//                 <dt className="text-sm font-medium text-gray-500">
//                   Email address
//                 </dt>
//                 <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                   {currentUser?.email}
//                 </dd>
//               </div>
//               <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//                 <dt className="text-sm font-medium text-gray-500">
//                   Account ID
//                 </dt>
//                 <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                   {currentUser?.uid}
//                 </dd>
//               </div>
//               <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//                 <dt className="text-sm font-medium text-gray-500">
//                   Organization name
//                 </dt>
//                 <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                   {currentOrganization?.name}
//                 </dd>
//               </div>
//             </dl>
//           </div>
//         )}
//       </div>

//       <div className="flex justify-end">
//         <Button
//           type="Button"
//           onClick={handleLogout}
//           className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//         >
//           Log Out
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Profile;

// src/pages/Profile.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logoutUser, updateUserProfile } from "../services/auth.service";
import { useOrganization } from "../contexts/OrganizationContext";
import {
  User,
  Mail,
  Building,
  Key,
  Pencil,
  LogOut,
  Loader,
  AlertCircle,
  CheckCircle,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(currentUser?.name || "");
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { currentOrganization } = useOrganization();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setName(currentUser?.name || "");
    setPhotoURL(currentUser?.photoURL || "");
    setEditing(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const updateData: { name?: string; photoURL?: string } = {};

      if (name !== currentUser?.name) {
        updateData.name = name;
      }

      if (photoURL !== currentUser?.photoURL) {
        updateData.photoURL = photoURL;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        await updateUserProfile(updateData);

        // Update local user state
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            ...updateData,
          });
        }

        setSuccessMessage("Profile updated successfully");

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }

      setEditing(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err: any) {
      console.error("Error logging out:", err);
      setError(err.message || "Failed to log out");
    }
  };

  return (
    <div className="w-full">
      <div className="bg-indigo-500 rounded-md w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6  mx-auto">
          <div className="flex-shrink-0">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser?.name || "User"}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-xl font-bold text-indigo-600 border-4 border-white shadow-md">
                {currentUser?.name ? getInitials(currentUser.name) : "U"}
              </div>
            )}
          </div>
          <div className="text-center md:text-left ">
            <h1 className="text-3xl font-bold text-white">
              {currentUser?.name || "Welcome"}
            </h1>
            <p className="text-indigo-100 mt-1">{currentUser?.email}</p>
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-indigo-800">
                {currentOrganization?.name || "Personal Account"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-8 rounded-md ">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 border-l-4 border-red-500 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg bg-green-50 p-4 border-l-4 border-green-500 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  {successMessage}
                </h3>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-semibold text-gray-900 flex items-center">
                Account Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Personal details and account settings
              </p>
            </div>
            {!editing && (
              <Button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Pencil className="mr-2 -ml-1 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>

          {editing ? (
            <div>
              <form onSubmit={handleSubmit} className="px-6 py-5">
                <div className="grid grid-cols-1 gap-6">
                  <div className="col-span-1">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={currentUser?.email || ""}
                        className="mt-1 pl-10 bg-gray-100 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        disabled
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Email address cannot be changed.
                    </p>
                  </div>

                  <div className="col-span-1">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Display Name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label
                      htmlFor="photoURL"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Profile Photo URL
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Image className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="photoURL"
                        id="photoURL"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://example.com/profile.jpg"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Enter a URL for your profile picture.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      onClick={handleCancel}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <dl>
                <div className="px-6 py-5 flex items-center  hover:bg-gray-50">
                  <dt className="w-1/3 text-sm font-medium text-gray-500 flex items-center">
                    <User className="mr-3 h-5 w-5 text-indigo-500" />
                    Display name
                  </dt>
                  <dd className="w-2/3 text-sm text-gray-900 font-medium">
                    {currentUser?.name || "Not set"}
                  </dd>
                </div>

                <div className="px-6 py-5 flex items-center border-t border-gray-200 hover:bg-gray-50">
                  <dt className="w-1/3 text-sm font-medium text-gray-500 flex items-center">
                    <Mail className="mr-3 h-5 w-5 text-indigo-500" />
                    Email address
                  </dt>
                  <dd className="w-2/3 text-sm text-gray-900 font-medium">
                    {currentUser?.email}
                  </dd>
                </div>

                <div className="px-6 py-5 flex items-center border-t border-gray-200 hover:bg-gray-50">
                  <dt className="w-1/3 text-sm font-medium text-gray-500 flex items-center">
                    <Key className="mr-3 h-5 w-5 text-indigo-500" />
                    Account ID
                  </dt>
                  <dd className="w-2/3 text-sm text-gray-900 font-mono bg-gray-100 p-1 rounded">
                    {currentUser?.uid}
                  </dd>
                </div>

                <div className="px-6 py-5 flex items-center border-t border-gray-200 hover:bg-gray-50">
                  <dt className="w-1/3 text-sm font-medium text-gray-500 flex items-center">
                    <Building className="mr-3 h-5 w-5 text-indigo-500" />
                    Organization
                  </dt>
                  <dd className="w-2/3 text-sm text-gray-900 font-medium">
                    {currentOrganization?.name || "Personal Account"}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="mr-2 -ml-1 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
