import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="language-selector">
      <button
        className={`language-btn ${i18n.language === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
      >
        English
      </button>
      <button
        className={`language-btn ${i18n.language === 'hi' ? 'active' : ''}`}
        onClick={() => changeLanguage('hi')}
      >
        हिंदी
      </button>
    </div>
  );
};

export default LanguageSelector; 