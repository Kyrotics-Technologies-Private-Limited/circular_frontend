// src/components/organizations/OrganizationDetails.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Organization } from "../../types/Organization";
import {
  getOrganizationbyId,
  updateOrganization,
} from "../../services/organization.service";
import { useAuth } from "../../contexts/AuthContext";
import MembersManagement from "./MembersManagement";

const OrganizationDetails: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [name, setName] = useState("");
  const [CIN, setCIN] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isAdmin = organization?.ownerUid === currentUser?.uid;

  // Fetch organization details
  useEffect(() => {
    const fetchOrganization = async () => {
      if (!organizationId) {
        navigate("/organizations");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const orgData = await getOrganizationbyId(organizationId);
        setOrganization(orgData);
        setName(orgData.name);
        setCIN(orgData.CIN);
      } catch (err: any) {
        console.error("Error fetching organization:", err);
        setError(err.message || "Failed to load organization details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationId, navigate]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organizationId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await updateOrganization(organizationId, {
        name,
        CIN,
      });

      // Update local state with new values
      if (organization) {
        setOrganization({
          ...organization,
          name,
          CIN,
        });
      }

      setEditing(false);
      setSuccessMessage("Organization updated successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error("Error updating organization:", err);
      setError(err.message || "Failed to update organization");
    } finally {
      setSaving(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate("/organizations");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Organization not found
        </h2>
        <button
          onClick={handleBack}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Organizations
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Organizations
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Organization Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            View and manage organization information
          </p>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          {editing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cin"
                    className="block text-sm font-medium text-gray-700"
                  >
                    CIN
                  </label>
                  <input
                    type="text"
                    name="cin"
                    id="cin"
                    value={CIN}
                    onChange={(e) => setCIN(e.target.value)}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Name</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {organization.name}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">CIN</h4>
                <p className="mt-1 text-sm text-gray-900">{organization.CIN}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {organization.status}
                </p>
              </div>

              {isAdmin && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Edit Organization
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="mt-8">
          <MembersManagement
            organizationId={organizationId!}
            isAdmin={isAdmin}
          />
        </div>
      )}
    </div>
  );
};

export default OrganizationDetails;
