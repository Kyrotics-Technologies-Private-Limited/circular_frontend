// src/components/translation/TranslationOptions.tsx
import React from "react";
import { LanguageOption } from "../../types/Translation";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TranslationOptionsProps {
  languages: LanguageOption[];
  sourceLanguage: string;
  selectedLanguage: string;
  onSourceLanguageChange: (language: string) => void;
  onLanguageChange: (language: string) => void;
  onTranslate: () => void;
  translating: boolean;
  hasOriginalContent: boolean;
}

const TranslationOptions: React.FC<TranslationOptionsProps> = ({
  languages,
  sourceLanguage,
  selectedLanguage,
  onSourceLanguageChange,
  onLanguageChange,
  onTranslate,
  translating,
  hasOriginalContent,
}) => {
  // Default languages if API fails to load
  const defaultLanguages: LanguageOption[] = [
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ja", name: "Japanese" },
    { code: "zh", name: "Chinese" },
    { code: "ru", name: "Russian" },
  ];

  // Use API languages or fall back to defaults
  const displayLanguages = languages.length > 0 ? languages : defaultLanguages;

  const getLanguageName = (code: string): string => {
    const language = displayLanguages.find((lang) => lang.code === code);
    return language ? language.name : code;
  };

  return (
    <div className="w-full bg-white border border-gray-300 rounded-md p-4">
      <div className="flex flex-wrap items-center gap-4 w-full">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source Language
          </label>
          <Select
            value={sourceLanguage}
            onValueChange={onSourceLanguageChange}
            disabled={translating}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{getLanguageName(sourceLanguage)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {displayLanguages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Language
          </label>
          <Select
            value={selectedLanguage}
            onValueChange={onLanguageChange}
            disabled={translating}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{getLanguageName(selectedLanguage)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {displayLanguages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end min-w-[120px] pb-[2px]">
          <Button
            onClick={onTranslate}
            disabled={translating || !hasOriginalContent}
            className="w-full inline-flex items-center justify-center px-4 py-2 mt-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {translating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Translating...
              </>
            ) : (
              "Translate"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TranslationOptions;
