// src/components/files/BreadcrumbNav.tsx
import React from "react";
import { Folder } from "../../types/File";
import { Home, ChevronRight, CornerUpLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BreadcrumbNavProps {
  currentPath: Folder[];
  onFolderClick: (folder: Folder) => void;
  onRootClick: () => void;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  currentPath,
  onFolderClick,
  onRootClick,
}) => {
  const handleBackClick = () => {
    if (currentPath.length === 0) return;
    if (currentPath.length === 1) {
      onRootClick();
    } else {
      const parentFolder = currentPath[currentPath.length - 2];
      onFolderClick(parentFolder);
    }
  };

  return (
    <nav className="flex items-center gap-1" aria-label="Breadcrumb">
      {currentPath.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackClick}
          className="h-8 w-8 text-muted-foreground hover:text-foreground mr-1"
          aria-label="Go back"
        >
          <CornerUpLeft className="h-4 w-4" />
        </Button>
      )}
      <ol className="flex items-center gap-1 flex-wrap">
        <li>
          <Button
            variant="ghost"
            onClick={onRootClick}
            className={cn(
              "h-8 px-2 text-muted-foreground hover:text-foreground",
              currentPath.length === 0 && "text-foreground font-medium"
            )}
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Button>
        </li>

        {currentPath.map((folder, index) => {
          const isLast = index === currentPath.length - 1;
          return (
            <li key={folder.id} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
              <Button
                variant="ghost"
                onClick={() => onFolderClick(folder)}
                className={cn(
                  "h-8 px-2 text-sm max-w-[220px] truncate",
                  isLast
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="truncate">{folder.name}</span>
              </Button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;
