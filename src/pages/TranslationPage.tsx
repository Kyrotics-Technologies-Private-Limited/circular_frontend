// src/pages/TranslationPage.tsx
import React from 'react';
import TranslationEditor from '../components/translations/TranslationEditor';

const TranslationPage: React.FC = () => {
  return (
    <div className="h-full">
      <TranslationEditor />
    </div>
  );
};

export default TranslationPage;