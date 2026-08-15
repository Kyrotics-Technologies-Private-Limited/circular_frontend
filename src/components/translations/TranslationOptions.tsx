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
import { Languages, ArrowRight, Loader2 } from "lucide-react";

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

  const displayLanguages = languages.length > 0 ? languages : defaultLanguages;

  const getLanguageName = (code: string): string => {
    const language = displayLanguages.find((lang) => lang.code === code);
    return language ? language.name : code;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden lg:inline">
          Source:
        </span>
        <Select
          value={sourceLanguage}
          onValueChange={onSourceLanguageChange}
          disabled={translating}
        >
          <SelectTrigger className="w-[110px] h-7 text-xs">
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

      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground hidden md:inline" />

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden lg:inline">
          Target:
        </span>
        <Select
          value={selectedLanguage}
          onValueChange={onLanguageChange}
          disabled={translating}
        >
          <SelectTrigger className="w-[110px] h-7 text-xs">
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
        size="sm"
        className="h-7 text-xs"
      >
        {translating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
            Translating...
          </>
        ) : (
          <>
            <Languages className="h-3.5 w-3.5 mr-2" />
            Translate
          </>
        )}
      </Button>
    </div>
  );
};

export default TranslationOptions;
