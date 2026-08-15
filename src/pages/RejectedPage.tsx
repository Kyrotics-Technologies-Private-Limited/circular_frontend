// src/pages/RejectedPage.tsx
import React from 'react';
import { XCircle, LogOut } from 'lucide-react';
import { logoutUser } from '../services/auth.service';
import { Button } from '@/components/ui/button';

const RejectedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-red-50 border-b border-red-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <XCircle className="text-red-500" size={20} />
          <span className="font-medium text-red-700">Your organization registration has been rejected</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logoutUser()}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default RejectedPage;
