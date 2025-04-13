// src/components/organizations/OrganizationForm.tsx
import React, { useState } from "react";
import { createOrganization } from "../../services/organization.service";
// import { useOrganization } from "../../contexts/OrganizationContext";

interface OrganizationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const OrganizationForm: React.FC<OrganizationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [CIN, setCIN] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const { refreshOrganizations } = useOrganization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !CIN) {
      setError("Organization name and CIN are required");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      await createOrganization({ name, CIN });
      // await refreshOrganizations();

      setName("");
      setCIN("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Error creating organization:", err);
      setError(err.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Create New Organization
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Create a new organization to manage files and translations.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mx-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200">
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Organization Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter organization name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="cin"
                className="block text-sm font-medium text-gray-700"
              >
                CIN (Company Identification Number) *
              </label>
              <input
                type="text"
                id="cin"
                name="cin"
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter company identification number"
                value={CIN}
                onChange={(e) => setCIN(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? "Creating..." : "Create Organization"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationForm;
