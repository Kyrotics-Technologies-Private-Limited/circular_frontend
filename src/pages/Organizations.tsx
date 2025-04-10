// // src/pages/Organizations.tsx
// import React, { useState } from "react";
// import { useOrganization } from "../contexts/OrganizationContext";
// import OrganizationList from "../components/organizations/OrganizationList";
// import OrganizationForm from "../components/organizations/OrganizationForm";

// const Organizations: React.FC = () => {
//   const { organizations, loading, error, refreshOrganizations } =
//     useOrganization();
//   const [showCreateForm, setShowCreateForm] = useState(false);

//   const handleCreateSuccess = async () => {
//     await refreshOrganizations();
//     setShowCreateForm(false);
//   };

//   const handleCreateNew = () => {
//     setShowCreateForm(true);
//   };

//   const handleCancelCreate = () => {
//     setShowCreateForm(false);
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-semibold text-gray-900">Organizations</h1>
//         <p className="mt-1 text-sm text-gray-500">
//           Manage your organizations and team members
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

//       {loading ? (
//         <div className="flex justify-center py-8">
//           <div className="spinner">Loading...</div>
//         </div>
//       ) : showCreateForm ? (
//         <OrganizationForm
//           onSuccess={handleCreateSuccess}
//           onCancel={handleCancelCreate}
//         />
//       ) : (
//         <OrganizationList
//           organizations={organizations}
//           onCreateNew={handleCreateNew}
//         />
//       )}
//     </div>
//   );
// };

// export default Organizations;
import React from 'react'

const Organizations = () => {
  return (
    <div>Organizations</div>
  )
}

export default Organizations