import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    lng: localStorage.getItem('i18nextLng') || 'en',
    supportedLngs: ['en', 'pt', 'es', 'fr'],
    defaultNS: 'translation',
    resources: {
      en: {
        translation: en
      },
      pt: {
        translation: pt
      },
      es: {
        translation: es
      },
      fr: {
        translation: fr
      }
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Update HTML lang attribute on language change
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;