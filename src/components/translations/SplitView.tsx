// src/components/translation/SplitView.tsx
import React, { useState, useEffect } from 'react';

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
  translatedContent,
  onTranslatedContentChange,
}) => {
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
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
      
      let percentage = (leftWidth / containerWidth) * 100;
      percentage = Math.max(30, Math.min(70, percentage));
      
      setSplitRatio(percentage);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };
    
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  return (
    <div id="split-container" className="w-full h-full flex">
      {/* Original content pane */}
      <div 
        className="h-full overflow-auto border border-gray-300 rounded-md bg-gray-50 transition-none"
        style={{ width: `${splitRatio}%`, pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        <div className="p-1 bg-gray-200 text-gray-700 text-sm font-medium">Original Document</div>
        <iframe src={originalContent || undefined} width="100%" height="100%"></iframe>
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
      
      {/* Translated content pane */}
      <div 
        className="h-full overflow-auto border border-gray-300 rounded-md flex flex-col transition-none"
        style={{ width: `${100 - splitRatio}%`, pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        <div className="p-1 bg-gray-200 text-gray-700 text-sm font-medium flex items-center justify-between">
          <span>Translated Document</span>
          {translatedContent && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="px-2 py-0.5 text-xs rounded bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              {isEditMode ? '👁 Preview' : '✏️ Edit HTML'}
            </button>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          {isEditMode ? (
            /* Edit mode — raw HTML source editing */
            <textarea
              value={translatedContent}
              onChange={(e) => onTranslatedContentChange(e.target.value)}
              placeholder="Translated content will appear here..."
              className="w-full h-full p-4 resize-none border-none outline-none text-sm leading-relaxed font-mono bg-gray-50"
              style={{ minHeight: '100%' }}
            />
          ) : (
            /* Preview mode — rendered HTML */
            <div
              className="p-4 prose prose-sm max-w-none"
              style={{ minHeight: '100%' }}
              dangerouslySetInnerHTML={{
                __html: translatedContent || '<p class="text-gray-400">Translated content will appear here...</p>'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitView;
