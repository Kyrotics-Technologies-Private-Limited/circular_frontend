// src/components/layout/AdminSidebar.tsx
import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigation } from "../../contexts/NavigationContext";
import {
  LayoutDashboard,
  Building2,
  Users,
  Inbox,
  FolderOpen,
  Share2,
  UserCog,
  Settings,
  UserCircle,
  ShieldCheck,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { setActiveItem } = useNavigation();
  const location = useLocation();

  const isSuperAdmin = currentUser?.role === "super_admin";
  const isAdmin = currentUser?.role === "admin";

  const navigation = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    ...(isSuperAdmin
      ? [
          { name: "Organizations", path: "/super-admin/organizations", icon: Building2 },
          { name: "Manage Users", path: "/super-admin/users", icon: Users },
          { name: "Manage Requests", path: "/super-admin/requests", icon: Inbox },
        ]
      : []),
    ...(isAdmin
      ? [
          { name: "Directory", path: "/admin/files", icon: FolderOpen },
          { name: "Shared Directory", path: "/admin/shared", icon: Share2 },
          { name: "User Management", path: "/admin/user-management", icon: UserCog },
          { name: "Organization Settings", path: "/admin/organization-settings", icon: Settings },
        ]
      : []),
    { name: "Profile", path: "/admin/profile", icon: UserCircle },
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    const activeNav = navigation.find(item =>
      currentPath === item.path || currentPath.startsWith(item.path + '/')
    );

    if (activeNav) {
      setActiveItem(activeNav.name);
    }
  }, [location.pathname, navigation, setActiveItem]);

  const initials = currentUser?.name?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || "?";
  const roleLabel = isSuperAdmin ? "Super Admin" : "Admin";

  return (
    <div className="h-full flex flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/70 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-foreground tracking-tight">Bhasantar</p>
            <p className="text-[11px] text-muted-foreground font-medium">{roleLabel} Console</p>
          </div>
        </div>
        <button
          type="button"
          className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 h-0 overflow-y-auto">
        <nav className="px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Administration
          </p>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => {
                  setActiveItem(item.name);
                  onClose();
                }}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`
                }
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.75} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="flex-shrink-0 border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {currentUser?.name || "Admin User"}
            </p>
            <p className="text-xs font-semibold text-primary">{roleLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
