export interface Organization {
    id: string;
    name: string;
    description: string;
    members: string[];
    admins: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }
  