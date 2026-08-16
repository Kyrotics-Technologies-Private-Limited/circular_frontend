// src/components/translation/SplitView.tsx
import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Eye, Pencil, GripVertical, FileText, Languages, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import HtmlEditor from './HtmlEditor';
import { downloadFile } from '../../services/file.service';
import { Button } from '../ui/button';

export type ViewMode = 'split' | 'original' | 'translated';

interface SplitViewProps {
  originalContent: string;
  translatedContent: string;
  fileType?: string;
  fileName?: string;
  viewMode: ViewMode;
  isEditMode: boolean;
  onIsEditModeChange: (mode: boolean) => void;
  onTranslatedContentChange: (content: string) => void;
}

const SPLIT_KEY = 'circular:split-ratio';

const getInitialSplit = (): number => {
  try {
    const stored = Number(localStorage.getItem(SPLIT_KEY));
    if (stored >= 30 && stored <= 70) return stored;
  } catch {
    /* ignore */
  }
  return 50;
};

const SplitView: React.FC<SplitViewProps> = ({
  originalContent,
  translatedContent,
  fileType,
  fileName,
  viewMode,
  isEditMode,
  onIsEditModeChange,
  onTranslatedContentChange,
}) => {
  const [splitRatio, setSplitRatio] = useState<number>(getInitialSplit);
  const [isDragging, setIsDragging] = useState(false);

  const sanitizedContent = translatedContent
    ? DOMPurify.sanitize(translatedContent, { USE_PROFILES: { html: true } })
    : '';

  // Handle split view resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const resetSplit = () => setSplitRatio(50);

  useEffect(() => {
    try {
      localStorage.setItem(SPLIT_KEY, String(splitRatio));
    } catch {
      /* ignore */
    }
  }, [splitRatio]);

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

  const isImage = !!fileType?.includes('image');
  const isPdf = !!fileType?.includes('pdf');
  const isInlineText =
    !!fileType?.includes('html') || fileType === 'text/plain';

  const renderOriginalContent = () => {
    if (isImage) {
      return (
        <img
          src={originalContent || undefined}
          alt="Original document"
          className="w-full h-full object-contain"
        />
      );
    }
    if (isPdf || isInlineText) {
      return (
        <iframe
          src={originalContent || undefined}
          title="Original document"
          width="100%"
          height="100%"
          className="flex-1"
        />
      );
    }
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileText className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground truncate max-w-xs" title={fileName}>
            {fileName || 'Document'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            Preview isn't available for this file type.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(originalContent, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Open original
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadFile(originalContent, fileName || 'original')}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      </div>
    );
  };

  const renderTranslatedContent = () => {
    if (isEditMode) {
      return (
        <HtmlEditor
          value={translatedContent}
          onChange={onTranslatedContentChange}
        />
      );
    }

    if (!translatedContent) {
      return (
        <div className="p-8 h-full flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-translation/10 text-translation-foreground">
            <Languages className="h-7 w-7" strokeWidth={1.75} />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            No translation yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Pick a target language and click Translate to generate the translated document here.
          </p>
        </div>
      );
    }

    return (
      <div
        className="p-4 prose prose-sm max-w-none"
        style={{ minHeight: '100%' }}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  };

  return (
    <div id="split-container" className="w-full h-full flex">
      {viewMode !== 'translated' && (
        <div
          className={cn(
            "h-full overflow-auto border border-border rounded-xl bg-muted/20 flex flex-col transition-none",
            viewMode === 'original' ? 'w-full' : ''
          )}
          style={
            viewMode === 'split'
              ? { width: `${splitRatio}%`, pointerEvents: isDragging ? 'none' : 'auto' }
              : undefined
          }
        >
          <div className={paneHeaderClass}>Original Document</div>
          <div className="flex-1 min-h-0 overflow-auto">{renderOriginalContent()}</div>
        </div>
      )}

      {viewMode === 'split' && (
        <div
          className={cn(
            "w-3 -mx-1.5 z-10 h-full cursor-col-resize flex items-center justify-center shrink-0 transition-colors",
            isDragging ? 'bg-primary/50' : 'hover:bg-primary/25'
          )}
          onMouseDown={handleMouseDown}
          onDoubleClick={resetSplit}
          title="Drag to resize · Double-click to reset"
        >
          <GripVertical className={cn("w-3.5 h-7 transition-colors", isDragging ? "text-primary" : "text-muted-foreground/60")} />
        </div>
      )}

      {viewMode !== 'original' && (
        <div
          className={cn(
            "h-full overflow-auto border border-border rounded-xl flex flex-col transition-none bg-card",
            viewMode === 'translated' ? 'w-full' : ''
          )}
          style={
            viewMode === 'split'
              ? { width: `${100 - splitRatio}%`, pointerEvents: isDragging ? 'none' : 'auto' }
              : undefined
          }
        >
          <div className={cn(paneHeaderClass, "rounded-tr-xl")}>
            <span>Translated Document</span>
            {translatedContent && (
              <button
                onClick={() => onIsEditModeChange(!isEditMode)}
                title="Toggle edit / preview (Ctrl/Cmd+T)"
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
          <div className="flex-1 overflow-auto">{renderTranslatedContent()}</div>
        </div>
      )}
    </div>
  );
};

export default SplitView;
