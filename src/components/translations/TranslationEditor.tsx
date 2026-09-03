// src/components/translation/TranslationEditor.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFileById } from "../../services/file.service";
import {
  translateFile,
  getSupportedLanguages,
  updateTranslatedContent,
  checkTranslationStatus,
} from "../../services/translation.service";
import { FileItem } from "../../types/File";
import { LanguageOption } from "../../types/Translation";
import SplitView, { type ViewMode } from "./SplitView";
import TranslationOptions from "./TranslationOptions";
import { Button } from "../ui/button";
import Loader from "@/components/ui/loader";
import { toast } from "react-toastify";
import {
  CornerUpLeft,
  Download,
  Loader2,
  Columns2,
  FileText,
  Languages,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateValue } from "@/utils/formatters";

const LANG_KEY = "circular:target-language";

type SaveState = "idle" | "dirty" | "saving" | "saved";

const TranslationEditor: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();

  const [file, setFile] = useState<FileItem | null>(null);
  const [originalContent, setOriginalContent] = useState("");
  const [translatedContent, setTranslatedContent] = useState("");
  const [targetLanguage, setTargetLanguage] = useState<string>("bn");
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const latestContentRef = useRef("");
  const lastSavedRef = useRef("");
  const fileIdRef = useRef(fileId);
  const translatingRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    fileIdRef.current = fileId;
  }, [fileId]);

  useEffect(() => {
    translatingRef.current = translating;
  }, [translating]);

  useEffect(() => {
    const fetchData = async () => {
      if (!fileId) return;

      try {
        setLoading(true);

        const [fileData, languagesData] = await Promise.all([
          getFileById(fileId),
          getSupportedLanguages(),
        ]);

        setFile(fileData);
        setOriginalContent(fileData.originalFileUrl || (fileData as any).url || "");
        
        let initialTranslatedContent = "";
        const tUrl = fileData.translatedFileUrl;
        if (tUrl) {
          try {
            const res = await fetch(tUrl);
            if (res.ok) {
              initialTranslatedContent = await res.text();
            }
          } catch (e) {
            console.error("Failed to fetch translated HTML:", e);
          }
        }
        
        setTranslatedContent(initialTranslatedContent);
        latestContentRef.current = initialTranslatedContent;
        lastSavedRef.current = initialTranslatedContent;

        const preferred =
          (fileData.targetLanguage && languagesData.some((l) => l.code === fileData.targetLanguage)
            ? fileData.targetLanguage
            : null) ||
          localStorage.getItem(LANG_KEY) ||
          "";
        setTargetLanguage(
          languagesData.some((l) => l.code === preferred)
            ? preferred
            : languagesData.some((l) => l.code === "bn")
              ? "bn"
              : languagesData[0]?.code || "es"
        );

        setLanguages(languagesData);

        if (fileData.translationStatus === 'PROCESSING') {
          const langToUse = languagesData.some((l) => l.code === preferred)
            ? preferred
            : languagesData.some((l) => l.code === "bn")
              ? "bn"
              : languagesData[0]?.code || "es";
          pollTranslation(fileId, langToUse);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        toast.error(err.message || "Failed to load file data", { autoClose: 6000 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fileId]);

  const saveTranslation = async () => {
    const content = latestContentRef.current;
    const currentFileId = fileIdRef.current;
    if (!currentFileId || content === lastSavedRef.current) {
      setSaveState("idle");
      return;
    }

    setSaveState("saving");
    try {
      await updateTranslatedContent(currentFileId, content);
      lastSavedRef.current = content;
      setSaveState("saved");
    } catch (error) {
      console.error("Error autosaving translation:", error);
      setSaveState("dirty");
      toast.error("Autosave failed. Press Ctrl/Cmd+S to retry.", { autoClose: 6000 });
    }
  };

  const queueSave = () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveTranslation();
    }, 800);
  };

  const handleTranslatedContentChange = (content: string) => {
    latestContentRef.current = content;
    setTranslatedContent(content);

    if (content === lastSavedRef.current) {
      setSaveState("idle");
      return;
    }
    setSaveState("dirty");
    queueSave();
  };

  const pollTranslation = async (fId: string, tLang: string, initialResult?: any) => {
    try {
      setTranslating(true);
      let result = initialResult;

      if (!result || result.translationStatus === 'PROCESSING' || result.status === 'PROCESSING') {
        if (!initialResult) {
           toast.info("Resuming translation progress...");
        } else {
           toast.info("Translation started. It may take a minute...");
        }
        
        while (isMounted.current) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          if (!isMounted.current) break;
          const statusRes = await checkTranslationStatus(fId);
          if (statusRes.status === 'COMPLETED' || statusRes.status === 'FAILED') {
             result = statusRes;
             break;
          }
        }
      }

      if (!isMounted.current || !result) return;

      let fetchedContent = "";
      if (result.status === 'COMPLETED' && result.translatedContentUrl) {
         try {
            const res = await fetch(result.translatedContentUrl);
            if (res.ok) fetchedContent = await res.text();
         } catch (e) {
            console.error("Failed to fetch translated HTML:", e);
         }
      }

      if (!isMounted.current) return;

      setTranslatedContent(fetchedContent);
      latestContentRef.current = fetchedContent;
      lastSavedRef.current = fetchedContent;
      setSaveState("saved");

      if (result.status === 'COMPLETED' && (!result.warnings || result.warnings.length === 0)) {
        toast.success("Translation completed successfully.", { autoClose: 4000 });
      } else if (result.status === 'COMPLETED' || result.status === 'PARTIAL') {
        const warns = result.warnings || ["Translation completed with quality warnings."];
        toast.warning(warns.join('\n'), { autoClose: 8000 });
        toast.success("Translation completed (Partial/Warnings). Please review.", { autoClose: 4000 });
      } else {
        toast.error(result.error || "Translation failed validation gate. The output might be corrupted.", { autoClose: 8000 });
      }

      setFile(prev => prev ? {
        ...prev,
        translatedFileUrl: result.translatedContentUrl,
        targetLanguage: tLang,
      } : prev);

    } catch (err: any) {
      if (!isMounted.current) return;
      console.error("Error polling translation:", err);
      toast.error("Error checking translation status.", { autoClose: 6000 });
    } finally {
      if (isMounted.current) setTranslating(false);
    }
  };

  const handleTranslate = async () => {
    if (!fileId || translatingRef.current) return;

    try {
      setTranslating(true);
      const result = await translateFile(fileId, targetLanguage);
      if (!isMounted.current) return;
      
      pollTranslation(fileId, targetLanguage, result);
      
    } catch (err: any) {
      if (!isMounted.current) return;
      console.error("Error translating:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to translate file";
      toast.error(errorMessage, { autoClose: 6000 });
      setTranslating(false);
    }
  };

  const translateRef = useRef(handleTranslate);
  translateRef.current = handleTranslate;

  const saveRef = useRef(saveTranslation);
  saveRef.current = saveTranslation;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
        saveRef.current();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (!translatingRef.current) translateRef.current();
      } else if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        setIsEditMode((m) => !m);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, targetLanguage);
  }, [targetLanguage]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (saveState === "dirty" || saveState === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveState]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      const content = latestContentRef.current;
      if (
        fileIdRef.current &&
        content &&
        content !== lastSavedRef.current
      ) {
        updateTranslatedContent(fileIdRef.current, content).catch(() => {});
      }
    };
  }, []);

  const handleDownload = async () => {
    if (!translatedContent) return;

      try {
        setDownloading(true);

        const { default: html2pdf } = await import("html2pdf.js");

        // html2canvas (used by html2pdf) crashes when trying to parse modern 'oklch' CSS functions
      // used heavily by Tailwind. We intercept getComputedStyle to safely replace them.
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = function(el, pseudoElt) {
        const style = originalGetComputedStyle(el, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            // Use target instead of receiver to avoid Illegal Invocation for native getters
            const value = (target as any)[prop];

            // Native methods must be bound to the original target
            if (typeof value === 'function') {
              return value.bind(target);
            }

            if (typeof value === 'string' && value.includes('oklch')) {
              // Replace any oklch color with a safe white/transparent fallback
              return 'rgba(255, 255, 255, 0)';
            }
            return value;
          }
        });
      };

      const cleanup = () => {
        window.getComputedStyle = originalGetComputedStyle;
      };

      const element = document.createElement('div');
      // Apply a white background to avoid transparent/black PDF issues, but don't force fonts or padding
      // so the original document styles (from the translated HTML) are perfectly preserved.
      element.style.backgroundColor = '#ffffff';
      element.innerHTML = translatedContent;

      const opt: any = {
        margin:       0,
        filename:     `${file?.name?.replace('.pdf', '') || 'Document'}_translated.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        pagebreak:    { mode: ['css', 'avoid-all', 'legacy'] },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save().then(() => {
        cleanup();
        setDownloading(false);
      }).catch((err: any) => {
        cleanup();
        console.error("Error generating PDF:", err);
        toast.error("Failed to generate PDF. Check console for details.", { autoClose: 6000 });
        setDownloading(false);
      });
    } catch (err: any) {
      console.error("Error setting up PDF generator:", err);
      toast.error("Failed to initialize PDF generator", { autoClose: 6000 });
      setDownloading(false);
    }
  };

  const handleBack = () => {
    if (saveState === "dirty" || saveState === "saving") {
      saveRef.current();
    }
    navigate(-1);
  };

  const statusTranslated = !!translatedContent;
  const fileSize = file?.sizeBytes ? (file.sizeBytes / 1024).toFixed(0) + " KB" : "";
  const uploadedDate = formatDateValue(file?.uploadedAt);

  const saveLabel =
    saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-3 bg-card p-2 border border-border rounded-xl overflow-x-auto flex-shrink-0">
        <Button
          onClick={handleBack}
          variant="outline"
          size="sm"
          className="h-8 flex-shrink-0"
        >
          <CornerUpLeft className="mr-1 h-3.5 w-3.5" />
          Back
        </Button>

        <div className="min-w-0 flex-shrink">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-foreground truncate max-w-[140px] lg:max-w-[220px]" title={file?.name}>
              {file?.name}
            </h1>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
                statusTranslated
                  ? "bg-green-600 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {statusTranslated ? "Translated" : "Not translated"}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
            {[fileSize, uploadedDate].filter(Boolean).join(" · ")}
            {saveState === "dirty" && <span className="text-amber-600 font-medium"> · Unsaved</span>}
            {saveLabel && (
              <span className="inline-flex items-center gap-1 font-medium">
                {" · "}
                {saveState === "saving" ? (
                  <Loader2 className="h-3 w-3 animate-spin inline" />
                ) : (
                  <Check className="h-3 w-3 inline text-green-600" />
                )}
                {saveLabel}
              </span>
            )}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1" title="View mode">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              title="Side by side"
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                viewMode === "split"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Columns2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("original")}
              title="Original only"
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                viewMode === "original"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("translated")}
              title="Translation only"
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                viewMode === "translated"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Languages className="h-3.5 w-3.5" />
            </button>
          </div>

          <TranslationOptions
            languages={languages}
            selectedLanguage={targetLanguage}
            onLanguageChange={setTargetLanguage}
            sourceLanguage="English"
            onSourceLanguageChange={() => {}}
            onTranslate={handleTranslate}
            translating={translating}
            hasOriginalContent={!!originalContent}
          />

          <div className="h-5 w-px bg-border mx-0.5"></div>

          <Button
            onClick={handleDownload}
            disabled={downloading || !translatedContent}
            variant="outline"
            size="sm"
            className="h-8"
            title="Download PDF"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        <SplitView
          originalContent={originalContent}
          translatedContent={translatedContent}
          translatedFileUrl={file?.translatedFileUrl}
          fileType={file?.mimeType}
          fileName={file?.name}
          viewMode={viewMode}
          isEditMode={isEditMode}
          onIsEditModeChange={setIsEditMode}
          onTranslatedContentChange={handleTranslatedContentChange}
        />
      </div>
    </div>
  );
};

export default TranslationEditor;
