// src/components/translation/SplitView.tsx
import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Eye, Pencil, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import HtmlEditor from './HtmlEditor';

interface SplitViewProps {
  originalContent: string;
  translatedContent: string;
  onTranslatedContentChange: (content: string) => void;
}

const SplitView: React.FC<SplitViewProps> = ({
  originalContent,
  translatedContent,
  onTranslatedContentChange,
}) => {
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const sanitizedContent = translatedContent
    ? DOMPurify.sanitize(translatedContent, { USE_PROFILES: { html: true } })
    : '<p class="text-gray-400">Translated content will appear here...</p>';

  // Handle split view resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

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

  const paneHeaderClass =
    "flex h-8 items-center justify-between bg-muted/60 text-muted-foreground text-xs font-semibold uppercase tracking-wide border-b border-border px-2.5";

  return (
    <div id="split-container" className="w-full h-full flex">
      {/* Original content pane */}
      <div
        className="h-full overflow-auto border border-border rounded-xl bg-muted/20 flex flex-col transition-none"
        style={{ width: `${splitRatio}%`, pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        <div className={paneHeaderClass}>Original Document</div>
        <iframe src={originalContent || undefined} width="100%" height="100%" className="flex-1" />
      </div>

      {/* Resizer */}
      <div
        className={cn(
          "w-1.5 h-full cursor-col-resize flex items-center justify-center hover:bg-primary/30 transition-colors",
          isDragging ? 'bg-primary/50' : 'bg-border'
        )}
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="w-3 h-6 text-muted-foreground" />
      </div>

      {/* Translated content pane */}
      <div
        className="h-full overflow-auto border border-border rounded-xl flex flex-col transition-none bg-card"
        style={{ width: `${100 - splitRatio}%`, pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        <div className={cn(paneHeaderClass, "rounded-tr-xl")}>
          <span>Translated Document</span>
          {translatedContent && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg border transition-colors font-medium normal-case tracking-normal",
                isEditMode
                  ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              {isEditMode ? (
                <>
                  <Eye className="h-3 w-3" />
                  Preview
                </>
              ) : (
                <>
                  <Pencil className="h-3 w-3" />
                  Edit
                </>
              )}
            </button>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          {isEditMode ? (
            <HtmlEditor
              value={translatedContent}
              onChange={onTranslatedContentChange}
            />
          ) : (
            <div
              className="p-4 prose prose-sm max-w-none"
              style={{ minHeight: '100%' }}
              dangerouslySetInnerHTML={{
                __html: sanitizedContent
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitView;
