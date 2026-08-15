// src/components/layout/Header.tsx
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../../types/User';
import { Organization } from '../../types/Organization';
import { logoutUser } from '../../services/auth.service';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { Menu, ChevronDown, LogOut, UserCircle, ShieldCheck } from 'lucide-react';
import { DropdownMenu } from '../ui/dropdownMenu';

interface HeaderProps {
  onSidebarToggle: () => void;
  user: User | null;
  organization: Organization | null;
  showAdminLink?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onSidebarToggle,
  user,
  showAdminLink = false,
}) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { currentOrganization } = useOrganization();
  const { activeItem } = useNavigation();

  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const initials = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <header className="flex-shrink-0 relative h-16 bg-background/80 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors md:hidden"
            onClick={onSidebarToggle}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold text-foreground">{activeItem}</span>
            {currentOrganization?.name && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{currentOrganization.name}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {showAdminLink && (
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Panel</span>
            </Link>
          )}

          <button
            ref={triggerRef}
            type="button"
            className="flex items-center gap-2 rounded-full p-0.5 pr-1.5 hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setShowProfileMenu(prev => !prev)}
            aria-haspopup="menu"
            aria-expanded={showProfileMenu}
          >
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              {initials}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </button>

          <DropdownMenu
            open={showProfileMenu}
            onClose={() => setShowProfileMenu(false)}
            triggerRef={triggerRef}
            align="end"
            className="w-56"
          >
            <div className="px-4 py-2.5 border-b border-border">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              {user?.role !== 'user' && (
                <p className="text-xs font-medium text-primary mt-0.5">
                  {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </p>
              )}
            </div>
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
              onClick={() => setShowProfileMenu(false)}
            >
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              Your Profile
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
