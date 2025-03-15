// src/utils/fileHelpers.ts

/**
 * Format file size to human-readable format
 * @param bytes File size in bytes
 * @param decimals Number of decimal places to show
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  /**
   * Get file icon based on file type
   * @param fileType MIME type of the file
   * @returns CSS class for the file icon
   */
  export const getFileIconClass = (fileType: string): string => {
    if (fileType.includes('pdf')) {
      return 'file-pdf';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return 'file-word';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return 'file-excel';
    } else if (fileType.includes('image')) {
      return 'file-image';
    } else {
      return 'file-generic';
    }
  };
  
  /**
   * Get file extension from filename
   * @param filename File name
   * @returns File extension (without the dot)
   */
  export const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  };
  
  /**
   * Check if file type is supported
   * @param fileType MIME type of the file
   * @returns Boolean indicating if file type is supported
   */
  export const isSupportedFileType = (fileType: string): boolean => {
    const supportedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    return supportedTypes.includes(fileType);
  };
  
  /**
   * Check if file size is within limits
   * @param fileSize File size in bytes
   * @param maxSize Maximum allowed size in bytes (default: 10MB)
   * @returns Boolean indicating if file size is within limits
   */
  export const isFileSizeValid = (fileSize: number, maxSize: number = 10 * 1024 * 1024): boolean => {
    return fileSize <= maxSize;
  };
  
  /**
   * Sanitize filename for safe storage
   * @param filename Original file name
   * @returns Sanitized file name
   */
  export const sanitizeFilename = (filename: string): string => {
    // Remove any non-alphanumeric characters except for periods, underscores, and hyphens
    return filename
      .replace(/[^\w\s.-]/gi, '')
      .replace(/\s+/g, '_');
  };
  
  /**
   * Generate a breadcrumb path from an array of folder IDs
   * @param folderPath Array of folder objects
   * @returns String representation of the path
   */
  export const generateBreadcrumbPath = (folderPath: Array<{ id: string; name: string }>): string => {
    return folderPath.map(folder => folder.name).join(' / ');
  };
  
  /**
   * Create a file download link
   * @param url File URL
   * @param filename File name for download
   */
  export const downloadFile = (url: string, filename: string): void => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };