// src/components/files/FileUpload.tsx
import React, { useState, useRef } from "react";
import { uploadFile } from "../../services/file.service";
import { useOrganization } from "../../contexts/OrganizationContext";
import Loader from "@/components/ui/loader";
import { Button } from "../ui/button";
import { UploadCloud, FileText, AlertCircle } from "lucide-react";

interface FileUploadProps {
  organizationId?: string;
  folderId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  organizationId: propOrgId,
  folderId,
  onSuccess,
  onCancel,
}) => {
  const { userType, currentOrganization } = useOrganization();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const organizationId =
    propOrgId ||
    (userType === "organization" ? currentOrganization?.id : undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF and Word documents are allowed");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      await uploadFile(file, organizationId, folderId || undefined);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
          <UploadCloud className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Upload File</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {userType === "organization" && currentOrganization
              ? `Upload a PDF or Word document to ${currentOrganization.name}`
              : "Upload a PDF or Word document to your personal space"}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="ml-2">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-200 cursor-pointer ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/30"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          disabled={loading}
        />

        <div className="space-y-3">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
              dragActive ? "bg-primary text-white" : "bg-primary/10 text-primary"
            }`}
          >
            <UploadCloud className="h-7 w-7" />
          </div>
          <div className="flex items-center justify-center text-sm text-muted-foreground gap-1">
            <span className="font-medium text-primary">Upload a file</span>
            <span>or drag and drop</span>
          </div>
          <p className="text-xs text-muted-foreground">PDF or Word up to 10MB</p>
        </div>
      </div>

      {file && (
        <div className="rounded-xl bg-muted/40 p-4 border border-border">
          <div className="flex items-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="ml-3 flex-1 truncate">
              <p className="text-sm font-medium text-foreground truncate">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          {loading && (
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-primary/15">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="h-full rounded-full bg-primary transition-all duration-300"
                ></div>
              </div>
              <div className="flex items-center justify-center gap-3 mt-2">
                <Loader className="h-4 w-4" />
                <p className="text-xs text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button onClick={handleUpload} disabled={!file || loading}>
          {loading ? "Uploading..." : "Upload File"}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
