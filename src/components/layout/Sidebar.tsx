// src/components/layout/Sidebar.tsx
import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { LayoutDashboard, FolderOpen, Share2, Building2, UserCircle, ShieldCheck, X, Languages, LogOut } from 'lucide-react';
import { logoutUser } from '../../services/auth.service';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';

interface SidebarProps {
  onClose: () => void;
  showOrgManagement?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, showOrgManagement = false }) => {
  const { currentUser } = useAuth();
  const { setActiveItem } = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Directory', path: '/files', icon: FolderOpen },
    { name: 'Shared Directory', path: '/shared', icon: Share2 },
    { name: 'Quick Translate', path: '/quick-translate', icon: Languages },
    ...(showOrgManagement
      ? [{ name: 'Organizations', path: '/organizations', icon: Building2 }]
      : []),
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  if (currentUser?.role === 'admin' || currentUser?.role === 'super_admin') {
    navigation.push({
      name: 'Admin Panel',
      path: '/admin/dashboard',
      icon: ShieldCheck,
    });
  }

  useEffect(() => {
    const currentPath = location.pathname;
    const activeNav = navigation.find(item =>
      currentPath === item.path || currentPath.startsWith(item.path + '/')
    );

    if (activeNav) {
      setActiveItem(activeNav.name);
    }
  }, [location.pathname, navigation, setActiveItem]);

  const initials = currentUser?.name?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="h-full flex flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/70 shadow-sm">
            <Languages className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-foreground tracking-tight">Bhasantar</p>
            <p className="text-[11px] text-muted-foreground font-medium">Translate &amp; Share</p>
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

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
       
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
              onClick={() => {
                setActiveItem(item.name);
                onClose();
              }}
            >
              <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${location.pathname.startsWith(item.path) ? '' : ''}`} strokeWidth={1.75} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex-shrink-0 border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {currentUser?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Sign out
            </Button>
          </>
        }
      >
        <p className="text-sm text-foreground">
          You will be safely logged out of Bhasantar.
        </p>
      </Modal>
    </div>
  );
};

export default Sidebar;
