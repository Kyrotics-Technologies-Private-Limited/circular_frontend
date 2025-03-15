// src/components/translation/TranslationOptions.tsx
import React from 'react';
import { LanguageOption } from '../../types/Translation';

interface TranslationOptionsProps {
  languages: LanguageOption[];
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onTranslate: () => void;
  translating: boolean;
  hasOriginalContent: boolean;
}

const TranslationOptions: React.FC<TranslationOptionsProps> = ({
  languages,
  selectedLanguage,
  onLanguageChange,
  onTranslate,
  translating,
  hasOriginalContent
}) => {
  // Default languages if API fails to load
  const defaultLanguages: LanguageOption[] = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' }
  ];
  
  // Use API languages or fall back to defaults
  const displayLanguages = languages.length > 0 ? languages : defaultLanguages;
  
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4">
      <div className="flex flex-wrap items-center space-x-4">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            Target Language
          </label>
          <select
            id="language"
            name="language"
            className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={translating}
          >
            {displayLanguages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 flex justify-end">
          <button
            type="button"
            onClick={onTranslate}
            disabled={translating || !hasOriginalContent}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {translating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Translating...
              </>
            ) : (
              'Translate'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationOptions;