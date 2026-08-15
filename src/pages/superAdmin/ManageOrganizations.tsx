import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, X, Save, Eye, AlertCircle, Building2 } from "lucide-react";

import { Organization } from "../../types/Organization";
import {
  createOrganization,
  deleteOrganization,
  getAllOrganizations,
  updateOrganization,
} from "../../services/organization.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import Loader from "@/components/ui/loader";

const ManageOrganizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<Partial<Organization>>({
    name: "",
    CIN: "",
    status: "pending",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteOrgId, setDeleteOrgId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      setIsLoading(true);
      try {
        const response = await getAllOrganizations();
        setOrganizations(response);
        setFilteredOrgs(response);
        setError(null);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setError("Failed to load organizations. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  useEffect(() => {
    let result = [...organizations];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (org) =>
          org.name.toLowerCase().includes(term) ||
          org.CIN.toLowerCase().includes(term)
      );
    }

    setFilteredOrgs(result);
  }, [searchTerm, organizations]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({
      name: "",
      CIN: "",
      status: "pending",
    });
    setShowModal(true);
  };

  const openEditModal = (org: Organization) => {
    setModalMode("edit");
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      CIN: org.CIN,
      status: org.status,
    });
    setShowModal(true);
  };

  const openViewModal = (org: Organization) => {
    setModalMode("view");
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      CIN: org.CIN,
      status: org.status,
    });
    setShowModal(true);
  };

  const handleCreateOrganization = async () => {
    try {
      setError(null);

      const response = await createOrganization(
        formData as { name: string; CIN: string }
      );

      const newOrg = response;
      setOrganizations((prev) => [...prev, newOrg]);
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create organization");
    }
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrg) return;

    try {
      setError(null);
      await updateOrganization(selectedOrg.id, formData);

      setOrganizations((prevOrgs) =>
        prevOrgs.map((org) =>
          org.id === selectedOrg.id ? { ...org, ...formData } : org
        )
      );

      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update organization");
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteOrgId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteOrganization = async () => {
    if (!deleteOrgId) return;

    try {
      setError(null);
      await deleteOrganization(deleteOrgId);

      setOrganizations((prevOrgs) =>
        prevOrgs.filter((org) => org.id !== deleteOrgId)
      );

      setShowDeleteConfirm(false);
      setDeleteOrgId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete organization");
      setShowDeleteConfirm(false);
    }
  };

  const statusVariant = (status: string): BadgeProps["variant"] => {
    if (status === "approved") return "success";
    if (status === "pending") return "warning";
    if (status === "rejected") return "destructive";
    return "secondary";
  };

  const actionButtonClass =
    "h-8 w-8 p-0 rounded-lg inline-flex items-center justify-center";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Manage Organizations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, and manage all organizations
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
        </Button>
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

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search organizations..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No organizations found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr>
                  {["Organization", "CIN", "Status", "Created", "Actions"].map(
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
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="ml-3 font-medium text-foreground">
                          {org.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {org.CIN}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={statusVariant(org.status)}>
                        {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {org.createdAt
                        ? new Date(org.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          onClick={() => openViewModal(org)}
                          variant="outline"
                          className={actionButtonClass}
                          title="View"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          onClick={() => openEditModal(org)}
                          variant="outline"
                          className={actionButtonClass}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          onClick={() => confirmDelete(org.id)}
                          variant="outline"
                          className={actionButtonClass}
                          title="Delete"
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
          modalMode === "create"
            ? "Add New Organization"
            : modalMode === "edit"
            ? "Edit Organization"
            : "Organization Details"
        }
        description={
          modalMode === "create"
            ? "Register a new organization in the system"
            : modalMode === "edit"
            ? "Update organization information and status"
            : "View organization information"
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            {modalMode !== "view" && (
              <Button
                onClick={
                  modalMode === "create"
                    ? handleCreateOrganization
                    : handleUpdateOrganization
                }
              >
                <Save className="h-4 w-4 mr-1" />
                {modalMode === "create" ? "Create" : "Update"}
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Organization Name
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={modalMode === "view"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              CIN (Company Identification Number)
            </label>
            <Input
              type="text"
              name="CIN"
              value={formData.CIN}
              onChange={handleInputChange}
              disabled={modalMode === "view"}
            />
          </div>

          {(modalMode === "edit" || modalMode === "view") && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={modalMode === "view"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}

          {selectedOrg && modalMode === "view" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Owner ID
              </label>
              <Input type="text" value={selectedOrg.ownerUid} disabled />
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Deletion"
        description="Are you sure you want to delete this organization? This action cannot be undone."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrganization}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          All users and files associated with this organization will lose access.
        </p>
      </Modal>
    </div>
  );
};

export default ManageOrganizations;
