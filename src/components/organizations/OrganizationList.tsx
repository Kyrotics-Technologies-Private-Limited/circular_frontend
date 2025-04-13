// src/components/organizations/OrganizationList.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Organization } from "../../types/Organization";
// import { useOrganization } from "../../contexts/OrganizationContext";

interface OrganizationListProps {
  organizations: Organization[];
  onCreateNew: () => void;
}

const OrganizationList: React.FC<OrganizationListProps> = ({
  organizations,
  onCreateNew,
}) => {
  // const { setCurrentOrganization } = useOrganization();

  // const handleSelect = (organization: Organization) => {
  //   setCurrentOrganization(organization);
  // };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Your Organizations
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organizations and file storage
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New
        </button>
      </div>

      <ul className="divide-y divide-gray-200">
        {organizations.length > 0 ? (
          organizations.map((org) => (
            <li key={org.id}>
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-md flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {org.name}
                    </div>
                    <div className="text-sm text-gray-500">CIN: {org.CIN}</div>
                    <div className="text-sm text-gray-500">
                      Status: {org.status}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    // onClick={() => handleSelect(org)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Select
                  </button>
                  <Link
                    to={`/organizations/${org.id}`}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="px-4 py-5 sm:px-6">
            <div className="text-center text-gray-500">
              <p>
                No organizations found. Create your first organization to get
                started.
              </p>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default OrganizationList;
