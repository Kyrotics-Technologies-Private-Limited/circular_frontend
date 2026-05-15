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
    { code: "hi", name: "Hindi" },
    { code: "bn", name: "Bengali" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "mr", name: "Marathi" },
    { code: "gu", name: "Gujarati" },
    { code: "kn", name: "Kannada" },
    { code: "ml", name: "Malayalam" },
    { code: "pa", name: "Punjabi" },
    { code: "or", name: "Odia" },
    { code: "as", name: "Assamese" },
    { code: "ur", name: "Urdu" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ja", name: "Japanese" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
  ];

  // Use API languages or fall back to defaults
  const displayLanguages = languages.length > 0 ? languages : defaultLanguages;

  const getLanguageName = (code: string): string => {
    const language = displayLanguages.find((lang) => lang.code === code);
    return language ? language.name : code;
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2">
        <span className="text-xs font-medium text-gray-700 whitespace-nowrap hidden md:inline">Source:</span>
        <Select
          value={sourceLanguage}
          onValueChange={onSourceLanguageChange}
          disabled={translating}
        >
          <SelectTrigger className="w-[110px] h-8 text-xs">
            <SelectValue>{getLanguageName(sourceLanguage)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {displayLanguages.map((language) => (
              <SelectItem key={language.code} value={language.code} className="text-xs">
                {language.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-xs font-medium text-gray-700 whitespace-nowrap hidden md:inline">Target:</span>
        <Select
          value={selectedLanguage}
          onValueChange={onLanguageChange}
          disabled={translating}
        >
          <SelectTrigger className="w-[110px] h-8 text-xs">
            <SelectValue>{getLanguageName(selectedLanguage)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {displayLanguages.map((language) => (
              <SelectItem key={language.code} value={language.code} className="text-xs">
                {language.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={onTranslate}
        disabled={translating || !hasOriginalContent}
        className="inline-flex items-center justify-center px-3 h-8 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
      >
        {translating ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
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
  );
};

export default TranslationOptions;
