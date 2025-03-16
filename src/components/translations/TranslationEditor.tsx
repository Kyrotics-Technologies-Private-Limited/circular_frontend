// src/components/translation/TranslationEditor.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import ReactQuill from 'react-quill';
// import "react-quill/dist/quill.snow.css";
import { getFileById } from "../../services/file.service";
import {
  translateFile,
  updateTranslatedContent,
  getSupportedLanguages,
  downloadTranslatedFile,
} from "../../services/translation.service";
import { FileItem } from "../../types/File";
import { LanguageOption } from "../../types/Translation";
import SplitView from "./SplitView";
import TranslationOptions from "./TranslationOptions";

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
  const [saving, setSaving] = useState(false);
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

        if (fileData.targetLanguage) {
          setTargetLanguage(fileData.targetLanguage);
        }

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

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!fileId) return;

    try {
      setError(null);
      setSuccessMessage(null);
      setSaving(true);

      await updateTranslatedContent(fileId, translatedContent);

      setSuccessMessage("Changes saved successfully");

      // Update file data
      if (file) {
        setFile({
          ...file,
          translatedContent,
        });
      }
    } catch (err: any) {
      console.error("Error saving changes:", err);
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Handle download
  const handleDownload = async (format: "pdf" | "docx") => {
    if (!fileId) return;

    try {
      setError(null);
      setDownloading(true);

      await downloadTranslatedFile(fileId, format);
    } catch (err: any) {
      console.error("Error downloading file:", err);
      setError(err.message || "Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  // Handle back button
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
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>

        <h1 className="text-xl font-semibold text-gray-900 truncate">
          {file?.name}
        </h1>

        <div className="flex space-x-3">
          <button
            onClick={() => handleDownload("docx")}
            disabled={downloading || !translatedContent}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {downloading ? "Downloading..." : "Download DOCX"}
          </button>
          <button
            onClick={() => handleDownload("pdf")}
            disabled={downloading || !translatedContent}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {downloading ? "Downloading..." : "Download PDF"}
          </button>
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

      <TranslationOptions
        languages={languages}
        selectedLanguage={targetLanguage}
        onLanguageChange={handleLanguageChange}
        onTranslate={handleTranslate}
        translating={translating}
        hasOriginalContent={!!originalContent}
      />

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

      <div className="flex justify-end">
        <button
          onClick={handleSaveChanges}
          disabled={saving || !translatedContent}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default TranslationEditor;
