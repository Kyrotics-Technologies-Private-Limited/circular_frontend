// src/components/layout/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types/User';
import { Organization } from '../../types/Organization';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { Menu, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onSidebarToggle: () => void;
  user: User | null;
  organization: Organization | null;
  showAdminLink?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onSidebarToggle,
  showAdminLink = false,
}) => {
  const { currentOrganization } = useOrganization();
  const { activeItem } = useNavigation();

  return (
    <header className="flex-shrink-0 relative h-16 bg-background/80 backdrop-blur border-b border-border md:hidden">
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
        </div>
      </div>
    </header>
  );
};

export default Header;
