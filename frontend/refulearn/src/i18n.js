import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/common.json';
import fr from './locales/fr/common.json';
import rw from './locales/rw/common.json';
import sw from './locales/sw/common.json';

const resources = {
  en: { common: en },
  fr: { common: fr },
  rw: { common: rw },
  sw: { common: sw },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en', // Set default language
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n; 