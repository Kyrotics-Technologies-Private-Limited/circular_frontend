export interface Translation {
    id: string;
    fileId: string;
    originalContent: string;
    translatedContent: string;
    targetLanguage: string;
    timestamp: Date;
    translatedBy: string;
  }
  
  export interface TranslationHistory {
    id: string;
    fileId: string;
    translatedContent: string;
    targetLanguage: string;
    timestamp: Date;
    translatedBy: string;
  }
  
  export interface LanguageOption {
    code: string;
    name: string;
  }
  