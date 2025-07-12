"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = exports.getI18nMiddleware = exports.setupI18n = void 0;
const i18next_1 = __importDefault(require("i18next"));
const i18next_fs_backend_1 = __importDefault(require("i18next-fs-backend"));
const i18next_http_middleware_1 = __importDefault(require("i18next-http-middleware"));
const path_1 = __importDefault(require("path"));
const localesPath = path_1.default.join(__dirname, '../../locales');
const setupI18n = async () => {
    await i18next_1.default
        .use(i18next_fs_backend_1.default)
        .use(i18next_http_middleware_1.default.LanguageDetector)
        .init({
        backend: {
            loadPath: path_1.default.join(localesPath, '{{lng}}/{{ns}}.json'),
            addPath: path_1.default.join(localesPath, '{{lng}}/{{ns}}.json'),
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
exports.setupI18n = setupI18n;
const getI18nMiddleware = () => {
    return i18next_http_middleware_1.default.handle(i18next_1.default);
};
exports.getI18nMiddleware = getI18nMiddleware;
const t = (key, options) => {
    if (!i18next_1.default.isInitialized) {
        return key;
    }
    return i18next_1.default.t(key, options);
};
exports.t = t;
exports.default = i18next_1.default;
//# sourceMappingURL=i18n.js.map