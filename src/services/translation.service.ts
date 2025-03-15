// src/services/translation.service.ts
import api from './api';
import { TranslationHistory, LanguageOption } from '../types/Translation';

/**
 * Translate a file
 */
export const translateFile = async (
  fileId: string,
  targetLanguage: string
): Promise<string> => {
  try {
    const response = await api.post(`/translations/${fileId}`, {
      targetLanguage
    });
    
    return response.data.translatedContent;
  } catch (error) {
    console.error('Error translating file:', error);
    throw error;
  }
};

/**
 * Update translated content
 */
export const updateTranslatedContent = async (
  fileId: string,
  translatedContent: string
): Promise<void> => {
  try {
    await api.put(`/translations/${fileId}`, {
      translatedContent
    });
  } catch (error) {
    console.error('Error updating translated content:', error);
    throw error;
  }
};

/**
 * Get translation history for a file
 */
export const getTranslationHistory = async (
  fileId: string
): Promise<TranslationHistory[]> => {
  try {
    const response = await api.get(`/translations/${fileId}/history`);
    return response.data.history;
  } catch (error) {
    console.error('Error getting translation history:', error);
    throw error;
  }
};

/**
 * Get supported languages for translation
 */
export const getSupportedLanguages = async (): Promise<LanguageOption[]> => {
  try {
    const response = await api.get('/translations/languages');
    return response.data.languages;
  } catch (error) {
    console.error('Error getting supported languages:', error);
    throw error;
  }
};

/**
 * Download translated file
 */
export const downloadTranslatedFile = async (
  fileId: string,
  format: 'pdf' | 'docx'
): Promise<void> => {
  try {
    const response = await api.get(`/translations/${fileId}/download`, {
      params: { format },
      responseType: 'blob'
    });
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = `translated_document.${format}`;
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading translated file:', error);
    throw error;
  }
};
