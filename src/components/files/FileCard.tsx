// src/components/files/FileCard.tsx
import React from "react";
import { FileItem } from "../../types/File";
import FileCardActions from "./fileCardActions";
import { FileText, Share2, Globe, File as FileIcon } from "lucide-react";

interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
  isShared?: boolean;
}

const FileCard: React.FC<FileCardProps> = ({
  file,
  isSelected,
  onSelect,
  onClick,
  isShared = false,
}) => {
  const getFileIcon = () => {
    if (file.type?.includes("pdf")) {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-600 flex-shrink-0">
          <FileText className="h-6 w-6" strokeWidth={1.75} />
        </div>
      );
    } else if (file.type?.includes("word") || file.type?.includes("document")) {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
          <FileText className="h-6 w-6" strokeWidth={1.75} />
        </div>
      );
    } else {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-500/10 text-slate-500 flex-shrink-0">
          <FileIcon className="h-6 w-6" strokeWidth={1.75} />
        </div>
      );
    }
  };

  return (
    <div
      className={`group relative rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
        isSelected
          ? "border-primary ring-2 ring-primary/30"
          : "border-border hover:border-primary/30"
      }`}
      onClick={onClick}
    >
      {/* Checkbox positioned at top right corner */}
      <div
        className="absolute top-3 right-3"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="flex items-start">
        <div className="flex-shrink-0">{getFileIcon()}</div>
        <div className="ml-3 flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate max-w-full" title={file.name}>
            {file.name}
          </h3>
          <div className="flex flex-col mt-1.5 space-y-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{file.size ? (file.size / 1024).toFixed(0) + " KB" : "0 KB"}</span>

              {file.isPublic && (
                <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">
                  <Globe className="h-2.5 w-2.5" />
                  Public
                </span>
              )}
            </div>

            {(isShared || file.isShared) && (
              <div className="flex flex-col text-[11px] text-muted-foreground mt-0.5">
                <div className="flex items-center max-w-full">
                  <Share2 className="h-3 w-3 mr-1 text-primary flex-shrink-0" />
                  <span className="truncate font-medium text-primary" title={file.sharedByName || ""}>
                    {file.sharedByName ? file.sharedByName : "Shared"}
                  </span>
                </div>
                {file.sharedAt && (
                  <span className="text-muted-foreground mt-0.5 ml-4">
                    {new Date(file.sharedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-3 right-3"
        onClick={(e) => e.stopPropagation()}
      >
        <FileCardActions item={file} type="file" onSuccess={() => {}} />
      </div>
    </div>
  );
};

export default FileCard;
