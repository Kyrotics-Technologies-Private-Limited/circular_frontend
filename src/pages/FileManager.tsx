// src/pages/FileManager.tsx
import React from "react";
import { useOrganization } from "../contexts/OrganizationContext";
import FileExplorer from "../components/files/FileExplorer";
import Loader from "@/components/ui/loader";

const FileManager: React.FC = () => {
  const { loading } = useOrganization();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FileExplorer />
    </div>
  );
};

export default FileManager;
