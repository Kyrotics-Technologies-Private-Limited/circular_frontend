// src/hooks/useTranslation.ts
import { useState, useEffect, useCallback } from 'react';
import { FileItem } from '../types/File';
import { TranslationHistory, LanguageOption } from '../types/Translation';
import { 
  getFileById, 
  downloadFile 
} from '../services/file.service';
import { 
  translateFile, 
  updateTranslatedContent, 
  getTranslationHistory, 
  getSupportedLanguages, 
  downloadTranslatedFile 
} from '../services/translation.service';

interface UseTranslationReturn {
  file: FileItem | null;
  originalContent: string;
  translatedContent: string;
  targetLanguage: string;
  languages: LanguageOption[];
  translationHistory: TranslationHistory[];
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

/**
 * Custom hook for translation functionality
 */
const useTranslation = (): UseTranslationReturn => {
  const [file, setFile] = useState<FileItem | null>(null);
  const [originalContent, setOriginalContent] = useState<string>('');
  const [translatedContent, setTranslatedContent] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('es'); // Default to Spanish
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [translationHistory, setTranslationHistory] = useState<TranslationHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [translating, setTranslating] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Load supported languages
  const loadLanguages = useCallback(async () => {
    try {
      const supportedLanguages = await getSupportedLanguages();
      setLanguages(supportedLanguages);
    } catch (err: any) {
      console.error('Error loading languages:', err);
      // Use default languages if API fails
      setLanguages([
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ru', name: 'Russian' }
      ]);
    }
  }, []);
  
  // Load file data
  const loadFile = async (fileId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Load file data
      const fileData = await getFileById(fileId);
      setFile(fileData);
      setOriginalContent(fileData.textContent || '');
      setTranslatedContent(fileData.translatedContent || '');
      
      if (fileData.targetLanguage) {
        setTargetLanguage(fileData.targetLanguage);
      }
      
      // Load translation history
      try {
        const history = await getTranslationHistory(fileId);
        setTranslationHistory(history);
      } catch (historyErr) {
        console.error('Error loading translation history:', historyErr);
        // Continue without history if it fails
      }
    } catch (err: any) {
      console.error('Error loading file:', err);
      setError(err.message || 'Failed to load file data');
    } finally {
      setLoading(false);
    }
  };
  
  // Translate content
  const translateContent = async (fileId: string, targetLang: string): Promise<void> => {
    try {
      setTranslating(true);
      setError(null);
      setSuccessMessage(null);
      
      const result = await translateFile(fileId, targetLang);
      
      setTranslatedContent(result);
      setSuccessMessage('Translation completed successfully');
      
      // Update file data
      if (file) {
        setFile({
          ...file,
          translatedContent: result,
          targetLanguage: targetLang
        });
      }
      
      // Refresh translation history
      try {
        const history = await getTranslationHistory(fileId);
        setTranslationHistory(history);
      } catch (historyErr) {
        console.error('Error refreshing translation history:', historyErr);
      }
    } catch (err: any) {
      console.error('Error translating:', err);
      setError(err.message || 'Failed to translate file');
    } finally {
      setTranslating(false);
    }
  };
  
  // Save translation
  const saveTranslation = async (fileId: string, content: string): Promise<void> => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      await updateTranslatedContent(fileId, content);
      
      setSuccessMessage('Translation saved successfully');
      
      // Update file data
      if (file) {
        setFile({
          ...file,
          translatedContent: content
        });
      }
      
      // Refresh translation history
      try {
        const history = await getTranslationHistory(fileId);
        setTranslationHistory(history);
      } catch (historyErr) {
        console.error('Error refreshing translation history:', historyErr);
      }
    } catch (err: any) {
      console.error('Error saving translation:', err);
      setError(err.message || 'Failed to save translation');
    } finally {
      setSaving(false);
    }
  };
  
  // Download original file
  const downloadOriginal = async (fileUrl: string, fileName: string): Promise<void> => {
    try {
      setDownloading(true);
      setError(null);
      
      await downloadFile(fileUrl, fileName);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      setError(err.message || 'Failed to download file');
    } finally {
      setDownloading(false);
    }
  };
  
  // Download translated file
  const downloadTranslation = async (fileId: string, format: 'pdf' | 'docx'): Promise<void> => {
    try {
      setDownloading(true);
      setError(null);
      
      await downloadTranslatedFile(fileId, format);
    } catch (err: any) {
      console.error('Error downloading translation:', err);
      setError(err.message || 'Failed to download translation');
    } finally {
      setDownloading(false);
    }
  };
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Clear success message
  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage(null);
  }, []);
  
  // Load languages on mount
  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);
  
  return {
    file,
    originalContent,
    translatedContent,
    targetLanguage,
    languages,
    translationHistory,
    loading,
    translating,
    saving,
    downloading,
    error,
    successMessage,
    loadFile,
    translateContent,
    saveTranslation,
    downloadOriginal,
    downloadTranslation,
    setTranslatedContent,
    setTargetLanguage,
    clearError,
    clearSuccessMessage
  };
};

export default useTranslation;