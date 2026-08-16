// src/components/translation/TranslationEditor.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFileById } from "../../services/file.service";
import {
  translateFile,
  getSupportedLanguages,
  updateTranslatedContent,
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
        setOriginalContent(fileData.url || "");
        setTranslatedContent(fileData.translatedContent || "");
        latestContentRef.current = fileData.translatedContent || "";
        lastSavedRef.current = fileData.translatedContent || "";

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

  const handleTranslate = async () => {
    if (!fileId || translatingRef.current) return;

    try {
      setTranslating(true);

      const result = await translateFile(fileId, targetLanguage);

      setTranslatedContent(result.translatedContent);
      latestContentRef.current = result.translatedContent;
      lastSavedRef.current = result.translatedContent;
      setSaveState("saved");

      if (result.translationStatus === 'PARTIAL' || result.warnings) {
        const warns = result.warnings || ["Translation completed with quality warnings."];
        toast.warning(warns.join('\n'), { autoClose: 8000 });
        toast.success("Translation completed (Partial/Warnings). Please review.", { autoClose: 4000 });
      } else if (result.translationStatus === 'FAILED') {
        toast.error("Translation failed validation gate. The output might be corrupted.", { autoClose: 8000 });
      } else {
        toast.success("Translation completed successfully.", { autoClose: 4000 });
      }

      if (file) {
        setFile({
          ...file,
          translatedContent: result.translatedContent,
          targetLanguage,
        });
      }
    } catch (err: any) {
      console.error("Error translating:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to translate file";
      toast.error(errorMessage, { autoClose: 6000 });
    } finally {
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

      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #000; font-size: 14px; background-color: #fff;">
          <style>
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 6px 10px; text-align: left; }
            th { font-weight: bold; background-color: #f3f4f6; }
            h2, h3, h4 { text-align: center; margin-top: 15px; margin-bottom: 10px; }
            p { margin-bottom: 10px; }
          </style>
          ${translatedContent}
        </div>
      `;

      const opt: any = {
        margin:       15,
        filename:     `${file?.name?.replace('.pdf', '') || 'Document'}_translated.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
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
  const fileSize = file?.size ? (file.size / 1024).toFixed(0) + " KB" : "";
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
          fileType={file?.type}
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
