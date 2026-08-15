import React, { useState, useEffect } from "react";
import { Building2, AlertCircle, Calendar, FileText, Users } from "lucide-react";
import { Organization } from "../types/Organization";
import { getAllOrganizations, getOrganizationUsers } from "../services/organization.service";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import Loader from "@/components/ui/loader";
import { Card } from "@/components/ui/card";

const statusVariant = (status: string): BadgeProps["variant"] => {
  if (status === "approved") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected") return "destructive";
  return "secondary";
};

const Organizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const orgs = await getAllOrganizations();
        setOrganizations(orgs);
        setError(null);

        const counts: Record<string, number> = {};
        for (const org of orgs) {
          try {
            const users = await getOrganizationUsers(org.id);
            counts[org.id] = users.length;
          } catch {
            counts[org.id] = 0;
          }
        }
        setMemberCounts(counts);
      } catch (err: any) {
        console.error("Error fetching organizations:", err);
        setError(err.message || "Failed to load organizations");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Organizations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse all organizations registered on the platform
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <h3 className="text-sm font-medium text-red-800 ml-2">{error}</h3>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      ) : organizations.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No organizations found
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card
              key={org.id}
              className="p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <Badge variant={statusVariant(org.status)}>
                  {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                </Badge>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-foreground truncate">
                {org.name}
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground font-mono truncate">
                CIN: {org.CIN || "—"}
              </p>

              <div className="mt-4 space-y-2">
                <p className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  {memberCounts[org.id] ?? 0} members
                </p>
                <p className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {org.createdAt
                    ? new Date(org.createdAt).toLocaleDateString()
                    : "—"}
                </p>
                <p className="flex items-center text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  Owner: {(org.ownerUid || "—").slice(0, 16)}
                  {org.ownerUid && org.ownerUid.length > 16 ? "…" : ""}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Organizations;
