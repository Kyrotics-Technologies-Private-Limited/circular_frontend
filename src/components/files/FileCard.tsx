import React from 'react';
import { FileItem } from '../../types/File';

interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, isSelected, onSelect, onClick }) => {
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Get icon based on file type
  const getFileIcon = (): React.ReactElement => {
    if (file.type.includes('pdf')) {
      return (
        <svg className="h-8 w-8 text-red-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return (
        <svg className="h-8 w-8 text-blue-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="h-8 w-8 text-gray-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString();
  };
  
  // Check if file has been translated
  const hasTranslation = !!file.translatedContent;

  return (
    <div 
      className={`relative rounded-lg border border-gray-300 bg-white p-4 shadow-sm hover:shadow 
        ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
    >
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0">
          {getFileIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-gray-900 truncate max-w-full" title={file.name}>
            {file.name}
          </h3>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          <p className="text-xs text-gray-500">Uploaded: {formatDate(file.uploadedAt)}</p>
          
          {hasTranslation && (
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Translated
              </span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 self-start z-10">
          <input
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={isSelected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={onClick}
      ></div>
    </div>
  );
};

export default FileCard;