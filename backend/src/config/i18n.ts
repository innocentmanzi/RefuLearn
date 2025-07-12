import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import path from 'path';

const localesPath = path.join(__dirname, '../../locales');

export const setupI18n = async (): Promise<void> => {
  await i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
      backend: {
        loadPath: path.join(localesPath, '{{lng}}/{{ns}}.json'),
        addPath: path.join(localesPath, '{{lng}}/{{ns}}.json'),
      },
      fallbackLng: process.env['DEFAULT_LOCALE'] || 'en',
      supportedLngs: (process.env['SUPPORTED_LOCALES'] || 'en,rw,fr,sw').split(','),
      ns: ['common', 'auth', 'courses', 'jobs', 'assessments', 'help'],
      defaultNS: 'common',
      detection: {
        order: ['querystring', 'header', 'cookie'],
        lookupQuerystring: 'lang',
        lookupHeader: 'accept-language',
        lookupCookie: 'i18next',
        caches: ['cookie'],
      },
      interpolation: {
        escapeValue: false,
      },
    });
};

export const getI18nMiddleware = () => {
  return middleware.handle(i18next);
};

export const t = (key: string, options?: any): string => {
  if (!i18next.isInitialized) {
    return key; // Return the key if i18next is not initialized
  }
  return i18next.t(key, options) as string;
};

export default i18next; 