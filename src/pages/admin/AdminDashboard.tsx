// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import { getFiles } from "../../services/file.service";
import { useOrganization } from "../../contexts/OrganizationContext";
import { FileItem } from "../../types/File";
import { getOrganizationUsers } from "../../services/organization.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/loader";
import {
  Users,
  FileText,
  Languages,
  FilePlus2,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const parseDate = (d: unknown): Date => {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  if (typeof d === "object") {
    const rec = d as { _seconds?: number; seconds?: number };
    if ("_seconds" in rec && typeof rec._seconds === "number")
      return new Date(rec._seconds * 1000);
    if ("seconds" in rec && typeof rec.seconds === "number")
      return new Date(rec.seconds * 1000);
  }
  return new Date(d as string);
};

const AdminDashboard: React.FC = () => {
  const { currentOrganization } = useOrganization();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<FileItem[]>([]);
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [totalTranslations, setTotalTranslations] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (currentOrganization) {
          const files = await getFiles(currentOrganization.id);

          const sorted = [...files]
            .sort((a, b) => {
              return (
                parseDate(b.uploadedAt).getTime() -
                parseDate(a.uploadedAt).getTime()
              );
            })
            .slice(0, 5);

          setRecentFiles(sorted);
          setTotalFiles(files);
          setTotalTranslations(files.filter((f) => f.translatedContent).length);

          const users = await getOrganizationUsers(currentOrganization.id);
          setTotalUsers(users.length);

          setError(null);
        }
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentOrganization]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  const statCard = (
    to: string | null,
    icon: React.ReactNode,
    iconClass: string,
    label: string,
    value: string | number
  ) => {
    const content = (
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl text-white flex-shrink-0",
            iconClass
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">
            {label}
          </p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
        </div>
      </div>
    );

    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        {to ? (
          <Link to={to} className="block">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your organization and statistics
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCard(
          "/admin/user-management",
          <Users className="h-5 w-5" />,
          "bg-primary",
          "Total Users",
          totalUsers
        )}

        {statCard(
          "/admin/files",
          <FolderOpen className="h-5 w-5" />,
          "bg-emerald-500",
          "Total Files",
          loading ? "..." : totalFiles.length
        )}

        {statCard(
          null,
          <Languages className="h-5 w-5" />,
          "bg-pink-500",
          "Total Translations",
          loading ? "..." : totalTranslations
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Recent Files
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your most recently uploaded files
            </p>
          </div>
          <Link to="/admin/files">
            <Button>
              <FilePlus2 className="h-4 w-4 mr-2" />
              Upload New File
            </Button>
          </Link>
        </div>

        <div className="border-t border-border">
          {recentFiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/40">
                  <tr>
                    {["Name", "Size", "Upload Date", "Status", "Actions"].map(
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
                  {recentFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-foreground">
                              {file.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {parseDate(file.uploadedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {file.translatedContent ? (
                          <Badge variant="success">Translated</Badge>
                        ) : (
                          <Badge variant="warning">Not Translated</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                          <Link
                            to={`/admin/translation/${file.id}`}
                            className="text-primary hover:text-primary/80"
                          >
                            {file.translatedContent ? "Edit" : "Translate"}
                          </Link>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            View
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-muted-foreground">No files uploaded yet.</p>
              <Link to="/files" className="mt-4 inline-block">
                <Button>
                  <FilePlus2 className="h-4 w-4 mr-2" />
                  Upload Your First File
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
