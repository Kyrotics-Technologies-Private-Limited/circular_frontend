// src/components/translation/TranslationEditor.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import ReactQuill from 'react-quill';
// import "react-quill/dist/quill.snow.css";
import { getFileById } from "../../services/file.service";
import {
  translateFile,
  getSupportedLanguages,
} from "../../services/translation.service";
import { FileItem } from "../../types/File";
import { LanguageOption } from "../../types/Translation";
import SplitView from "./SplitView";
// @ts-ignore
import html2pdf from 'html2pdf.js';
import TranslationOptions from "./TranslationOptions";
import { Button } from "../ui/button";
import { CornerUpLeft, Download } from "lucide-react";
// import { set } from "date-fns";

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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // const quillRef = useRef<ReactQuill | null>(null);
  const quillRef = useRef< null>(null);

  // Fetch file data and languages
  useEffect(() => {
    const fetchData = async () => {
      if (!fileId) return;

      try {
        setLoading(true);
        setError(null);

        const [fileData, languagesData] = await Promise.all([
          getFileById(fileId),
          getSupportedLanguages(),
        ]);

        setFile(fileData);
        setOriginalContent(fileData.url || "");
        setTranslatedContent(fileData.translatedContent || "");

        // if (fileData.targetLanguage) {
        //   setTargetLanguage(fileData.targetLanguage);
        // }
        setTargetLanguage(languagesData[0].name || "Bengali"); // Default to Spanish if not set

        setLanguages(languagesData);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load file data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fileId]);

 

  // Handle translation
  const handleTranslate = async () => {
    if (!fileId) return;

    try {
      setError(null);
      setSuccessMessage(null);
      setTranslating(true);

      const result = await translateFile(fileId, targetLanguage);

      setTranslatedContent(result);
      setSuccessMessage("Translation completed successfully");

      // Update file data
      if (file) {
        setFile({
          ...file,
          translatedContent: result,
          targetLanguage,
        });
      }

      console.log("Translation result:", file);
    } catch (err: any) {
      console.error("Error translating:", err);
      setError(err.message || "Failed to translate file");
    } finally {
      setTranslating(false);
    }
  };

  // Handle download via html2pdf (direct PDF download)
  const handleDownload = () => {
    if (!translatedContent) return;

    try {
      setDownloading(true);
      setError(null);

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

      // Create a temporary container for the PDF content
      const element = document.createElement('div');
      
      // Inject the translated HTML with strict PDF-friendly styling
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

      // Configure html2pdf options
      const opt: any = {
        margin:       15,
        filename:     `${file?.name?.replace('.pdf', '') || 'Document'}_translated.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generate and save the PDF
      html2pdf().set(opt).from(element).save().then(() => {
        cleanup();
        setDownloading(false);
      }).catch((err: any) => {
        cleanup();
        console.error("Error generating PDF:", err);
        setError("Failed to generate PDF. Check console for details.");
        setDownloading(false);
      });
    } catch (err: any) {
      console.error("Error setting up PDF generator:", err);
      setError("Failed to initialize PDF generator");
      setDownloading(false);
    }
  };

  // Handle back Button
  const handleBack = () => {
    navigate(-1);
  };

  // Handle translated content change
  const handleTranslatedContentChange = (content: string) => {
    setTranslatedContent(content);

  };

  // Handle language change
  const handleLanguageChange = (language: string) => {
    setTargetLanguage(language);
  };

  // Quill editor modules and formats
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "script",
    "indent",
    "align",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-2">
      <div className="flex items-center justify-between bg-white p-2 border border-gray-300 rounded-md overflow-x-auto gap-2">
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button
            onClick={handleBack}
            className="inline-flex items-center px-2 h-8 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <CornerUpLeft className="mr-1 h-3 w-3" />
            Back
          </Button>
          
          <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[150px] lg:max-w-[200px]" title={file?.name}>
            {file?.name}
          </h1>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <TranslationOptions
            languages={languages}
            selectedLanguage={targetLanguage}
            onLanguageChange={handleLanguageChange}
            sourceLanguage="English" // Assuming source language is always English
            onSourceLanguageChange={() => {}}
            onTranslate={handleTranslate}
            translating={translating}
            hasOriginalContent={!!originalContent}
          />
          
          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          {/* <Button
            onClick={handleSaveChanges}
            disabled={saving || !translatedContent}
            className="inline-flex justify-center items-center px-3 h-8 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
          >
            {saving ? "Saving..." : "Save"}
          </Button> */}
          <Button
            onClick={handleDownload}
            disabled={downloading || !translatedContent}
            className="inline-flex items-center px-2 h-8 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            title="Download PDF"
          >
            {downloading ? (
              <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                {successMessage}
              </h3>
            </div>
          </div>
        </div>
      )}



      <div className="flex-1 overflow-hidden">
        <SplitView
          originalContent={originalContent}
          translatedContent={translatedContent}
          onTranslatedContentChange={handleTranslatedContentChange}
          quillRef={quillRef}
          quillModules={quillModules}
          quillFormats={quillFormats}
        />
      </div>

    </div>
  );
};

export default TranslationEditor;
