export interface Translation {
    id: string;
    fileId: string;
    originalContent: string;
    translatedContent: string;
    targetLanguage: string;
    timestamp: Date;
    translatedBy: string;
  }
  
  export interface LanguageOption {
    code: string;
    name: string;
  }
  
  import { FileItem } from './File';

  export interface UseTranslationReturn {
    file: FileItem | null;
    originalContent: string;
    translatedContent: string;
    targetLanguage: string;
    languages: LanguageOption[];
    loading: boolean;
    translating: boolean;
    saving: boolean;
    downloading: boolean;
    error: string | null;
    successMessage: string | null;
    loadFile: (fileId: string) => Promise<void>;
    translateContent: (fileId: string, targetLang: string) => Promise<void>;
    saveTranslation: (fileId: string, content: string) => Promise<void>;
    downloadOriginal: (fileUrl: string, fileName: string) => Promise<void>;
    downloadTranslation: (fileId: string, format: 'pdf' | 'docx') => Promise<void>;
    setTranslatedContent: (content: string) => void;
    setTargetLanguage: (language: string) => void;
    clearError: () => void;
    clearSuccessMessage: () => void;
  }