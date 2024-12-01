import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pt' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition"
      title={i18n.language === 'en' ? 'Switch to Portuguese' : 'Mudar para Inglês'}
    >
      <Globe className="h-5 w-5" />
      <span className="text-sm font-medium">{i18n.language.toUpperCase()}</span>
    </button>
  );
}

export default LanguageSwitcher;