// src/pages/superAdmin/SuperAdminDashboard.tsx
import React, { useState, useEffect } from "react";
import {
  Request,
  getAllRequests,
  approveRequest,
  rejectRequest,
} from "../../services/request.service";
import {
  getAllOrganizations,
  getOrganizationUsers,
} from "../../services/organization.service";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import Loader from "@/components/ui/loader";
import {
  Building2,
  Users,
  Clock,
  AlertCircle,
  User,
  FolderOpen,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const SuperAdminDashboard: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [organizationsCount, setOrganizationsCount] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      // Fetch Requests
      const allRequests = await getAllRequests();
      const pending = allRequests.filter((req) => req.status === "pending");
      setPendingRequests(pending);

      const recent = [...allRequests]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);
      setRecentRequests(recent);

      // Fetch Organizations and Users
      const organizations = await getAllOrganizations();
      setOrganizationsCount(organizations.length);

      let totalUserCount = 0;
      for (const org of organizations) {
        const users = await getOrganizationUsers(org.id);
        totalUserCount += users.length;
      }
      setTotalUsers(totalUserCount);

    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load dashboard data");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchAllData();
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveRequest(requestId);
      await fetchAllData();
    } catch (err: any) {
      console.error("Error approving request:", err);
      setError(err.message || "Failed to approve request");
    }
  };

  const handleRejectRequest = async (
    requestId: string,
    reason: string = "Request rejected by admin"
  ) => {
    try {
      await rejectRequest(requestId, reason);
      await fetchAllData();
    } catch (err: any) {
      console.error("Error rejecting request:", err);
      setError(err.message || "Failed to reject request");
    }
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const statusVariant = (status: string): BadgeProps["variant"] => {
    if (status === "pending") return "warning";
    if (status === "approved") return "success";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Super Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of all organizations and system statistics
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <h3 className="text-sm font-medium text-red-800 ml-2">{error}</h3>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500 text-white flex-shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-muted-foreground truncate">
                Organizations
              </dt>
              <dd>
                <div className="text-2xl font-semibold text-foreground">{organizationsCount}</div>
              </dd>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white flex-shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-muted-foreground truncate">
                Total Users
              </dt>
              <dd>
                <div className="text-2xl font-semibold text-foreground">{totalUsers}</div>
              </dd>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white flex-shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-muted-foreground truncate">
                Pending Requests
              </dt>
              <dd>
                <div className="text-2xl font-semibold text-foreground">
                  {pendingRequests.length}
                </div>
              </dd>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5">
          <h3 className="text-lg font-semibold text-foreground">
            Recent Requests
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest organization registration requests
          </p>
        </div>
        <div className="border-t border-border">
          <ul className="divide-y divide-border">
            {recentRequests.length > 0 ? (
              recentRequests.map((request) => (
                <li key={request.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary truncate">
                      Organization Registration Request
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <Badge variant={statusVariant(request.status)}>
                        {request.status === "pending"
                          ? formatTimeAgo(request.createdAt)
                          : request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-muted-foreground mr-6">
                        <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-muted-foreground" />
                        Owner ID: {request.ownerUid}
                      </p>
                      <p className="flex items-center text-sm text-muted-foreground">
                        <FolderOpen className="flex-shrink-0 mr-1.5 h-4 w-4 text-muted-foreground" />
                        {request.organizationName}
                      </p>
                    </div>
                    {request.status === "pending" && (
                      <div className="mt-2 sm:mt-0 sm:flex sm:space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                  {request.CIN && (
                    <div className="mt-1">
                      <p className="text-xs text-muted-foreground">
                        CIN: {request.CIN}
                      </p>
                    </div>
                  )}
                </li>
              ))
            ) : (
              <li className="px-6 py-12 text-center">
                <p className="text-muted-foreground">No recent requests</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
