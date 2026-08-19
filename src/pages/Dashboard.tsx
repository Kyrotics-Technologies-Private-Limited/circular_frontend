// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useOrganization } from "../contexts/OrganizationContext";
import { getFiles } from "../services/file.service";
import { FileItem } from "../types/File";
import { parseDateValue } from "../utils/formatters";
import {
  FileText,
  Languages,
  Share2,
  ArrowRight,
  Clock,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    currentOrganization,
    userType,
  } = useOrganization();
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecentFiles = async () => {
      try {
        setLoading(true);
        const files = await getFiles(userType === 'organization' ? currentOrganization?.id : undefined);
        const sorted = [...files]
          .sort(
            (a, b) =>
              (parseDateValue(b.uploadedAt)?.getTime() ?? 0) -
              (parseDateValue(a.uploadedAt)?.getTime() ?? 0)
          )
          .slice(0, 5);

        setTotalFiles(files.length);
        setRecentFiles(sorted);
      } catch (err: any) {
        console.error("Error fetching recent files:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentFiles();
  }, [currentOrganization, userType]);

  const translatedCount = recentFiles.filter((f) => f.translatedFileUrl).length;

  const stats = [
    {
      title: "Files",
      value: loading ? "..." : totalFiles,
      subtitle: userType === 'organization' && currentOrganization
        ? `In ${currentOrganization.name}`
        : 'In your personal space',
      icon: FileText,
      href: "/files",
      linkText: "View all files",
      gradient: "from-primary to-primary/70",
      iconBg: "bg-primary/10 text-primary",
    },
    {
      title: "Translations",
      value: loading ? "..." : translatedCount,
      subtitle: "Completed translations",
      icon: Languages,
      href: "/files",
      linkText: "Manage translations",
      gradient: "from-amber-500 to-amber-500/70",
      iconBg: "bg-amber-500/10 text-amber-600",
    },
    {
      title: userType === 'organization' ? "Shared Files" : "View All Files",
      value: "View",
      subtitle: userType === 'organization' ? "Collaborate with your team" : "Browse your documents",
      icon: Share2,
      href: userType === 'organization' ? "/shared" : "/files",
      linkText: userType === 'organization' ? "Open shared directory" : "Open file manager",
      gradient: "from-slate-700 to-slate-700/70",
      iconBg: "bg-slate-500/10 text-slate-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {currentUser?.name?.split(' ')[0] || "User"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your files and translations in one place.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ title, value, subtitle, icon: Icon, href, linkText, gradient, iconBg }) => (
          <div key={title} className="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className={`flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold text-white bg-linear-to-r ${gradient}`}>
                  {value}
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/30 rounded-b-2xl">
              <Link to={href} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                {linkText}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>



      {/* Recent files */}
      {recentFiles.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Recently Uploaded</h3>
            </div>
            <Link to="/files" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentFiles.map((file) => (
              <Link
                key={file.id}
                to={`/translation/${file.id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/40 transition-colors duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <FileText className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.sizeBytes ? (file.sizeBytes / 1024).toFixed(0) + " KB" : ""}
                      {file.translatedFileUrl && " · Translated"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
