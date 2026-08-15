// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Compass, ArrowRight } from 'lucide-react';

const NotFound: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <h2 className="mt-6 text-5xl font-extrabold text-foreground">
            404
          </h2>
          <p className="mt-2 text-2xl font-bold text-foreground">
            Page not found
          </p>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            The page you're looking for doesn't exist or you don't have
            permission to access it.
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <Link to={currentUser ? '/dashboard' : '/'}>
            <Button>
              Go to {currentUser ? 'Dashboard' : 'Home'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
