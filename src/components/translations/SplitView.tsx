// src/components/translation/SplitView.tsx
import React, { useState, useEffect } from 'react';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

interface SplitViewProps {
  originalContent: string;
  translatedContent: string;
  onTranslatedContentChange: (content: string) => void;
  quillRef: React.RefObject<null>;
  quillModules: any;
  quillFormats: string[];
}

const SplitView: React.FC<SplitViewProps> = ({
  originalContent,
  // translatedContent,
  // onTranslatedContentChange,
  // quillRef,
  // quillModules,
  // quillFormats
}) => {
  const [splitRatio, setSplitRatio] = useState(50); // Default 50/50 split
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle split view resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  // Handle resize when dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const container = document.getElementById('split-container');
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const leftWidth = e.clientX - containerRect.left;
      const containerWidth = containerRect.width;
      
      // Calculate percentage (constrained between 30% and 70%)
      let percentage = (leftWidth / containerWidth) * 100;
      percentage = Math.max(30, Math.min(70, percentage));
      
      setSplitRatio(percentage);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  return (
    <div id="split-container" className="w-full h-screen flex">
      {/* Original content pane */}
      <div 
        className="h-full overflow-auto border border-gray-300 rounded-md bg-gray-50"
        style={{ width: `${splitRatio}%` }}
      >
        <div className="p-1 bg-gray-200 text-gray-700 text-sm font-medium">Original Document</div>
        {/* <div className="p-4 whitespace-pre-wrap">{originalContent}</div> */}
        <iframe src={originalContent} width="100%" height="100%"></iframe>
      </div>
      
      {/* Resizer */}
      <div
        className={`w-2 h-full bg-gray-200 cursor-col-resize flex items-center justify-center hover:bg-indigo-200 ${
          isDragging ? 'bg-indigo-400' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="w-1 h-8 bg-gray-400 rounded"></div>
      </div>
      
      {/* Translated content pane (editable) */}
      <div 
        className="h-full overflow-auto border border-gray-300 rounded-md"
        style={{ width: `${100 - splitRatio}%` }}
      >
        <div className="p-1 bg-gray-200 text-gray-700 text-sm font-medium">Translated Document</div>
        <div className="h-[calc(100%-30px)]">
          {/* <ReactQuill
            ref={quillRef}
            theme="snow"
            value={translatedContent}
            onChange={onTranslatedContentChange}
            modules={quillModules}
            formats={quillFormats}
            className="h-full"
          /> */}
        </div>
      </div>
    </div>
  );
};

export default SplitView;
