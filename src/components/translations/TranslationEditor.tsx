// src/components/translation/TranslationEditor.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFileById } from "../../services/file.service";
import {
  translateFile,
  getSupportedLanguages,
} from "../../services/translation.service";
import { FileItem } from "../../types/File";
import { LanguageOption } from "../../types/Translation";
import SplitView from "./SplitView";
import TranslationOptions from "./TranslationOptions";
import { Button } from "../ui/button";
import Loader from "@/components/ui/loader";
import { toast } from "react-toastify";
import { CornerUpLeft, Download, Loader2 } from "lucide-react";

const TranslationEditor: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();

  const [file, setFile] = useState<FileItem | null>(null);
  const [originalContent, setOriginalContent] = useState("");
  const [translatedContent, setTranslatedContent] = useState("");
  const [targetLanguage, setTargetLanguage] = useState<string>("es"); // Default to Spanish
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

        setTargetLanguage(languagesData[0].name || "Bengali");

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

  const handleTranslate = async () => {
    if (!fileId) return;

    try {
      setTranslating(true);

      const result = await translateFile(fileId, targetLanguage);

      setTranslatedContent(result.translatedContent);

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

  // Handle download via html2pdf (direct PDF download)
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
    navigate(-1);
  };

  const handleTranslatedContentChange = (content: string) => {
    setTranslatedContent(content);
  };

  const handleLanguageChange = (language: string) => {
    setTargetLanguage(language);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between bg-card p-1.5 border border-border rounded-xl overflow-x-auto gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="h-7"
          >
            <CornerUpLeft className="mr-1 h-3.5 w-3.5" />
            Back
          </Button>

          <h1 className="text-sm font-semibold text-foreground truncate max-w-[150px] lg:max-w-[200px]" title={file?.name}>
            {file?.name}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <TranslationOptions
            languages={languages}
            selectedLanguage={targetLanguage}
            onLanguageChange={handleLanguageChange}
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
            className="h-7"
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
          onTranslatedContentChange={handleTranslatedContentChange}
        />
      </div>
    </div>
  );
};

export default TranslationEditor;
