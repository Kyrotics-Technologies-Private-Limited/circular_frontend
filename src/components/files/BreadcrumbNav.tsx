// src/components/files/BreadcrumbNav.tsx
import React from "react";
import { Folder } from "../../types/File";
import { CornerUpLeft } from "lucide-react";

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
    <nav className="flex items-center" aria-label="Breadcrumb">
      {currentPath.length > 0 && (
        <button
          onClick={handleBackClick}
          className="mr-4 text-gray-400 hover:text-gray-500"
        >
         <CornerUpLeft />
        </button>
      )}
      <ol className="flex items-center space-x-2">
        <li>
          <div>
            <button
              onClick={onRootClick}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="flex-shrink-0 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="sr-only">Home</span>
            </button>
          </div>
        </li>

        {currentPath.map((folder, index) => (
          <li key={folder.id}>
            <div className="flex items-center">
              <svg
                className="flex-shrink-0 h-5 w-5 text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <button
                onClick={() => onFolderClick(folder)}
                className={`ml-2 text-sm font-medium ${
                  index === currentPath.length - 1
                    ? "text-indigo-600 hover:text-indigo-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {folder.name}
              </button>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;
