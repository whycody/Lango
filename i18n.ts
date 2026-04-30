import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { createMMKV } from 'react-native-mmkv';
import { getLocales } from 'react-native-localize';

import enTranslation from './src/locales/en/translation.json';
import esTranslation from './src/locales/es/translation.json';
import itTranslation from './src/locales/it/translation.json';
import plTranslation from './src/locales/pl/translation.json';
import 'intl-pluralrules';

const SUPPORTED = ['en', 'pl', 'es', 'it'] as const;
type SupportedLang = (typeof SUPPORTED)[number];

const isSupported = (lang: string | undefined): lang is SupportedLang =>
    !!lang && (SUPPORTED as readonly string[]).includes(lang);

const resolveInitialLang = (): SupportedLang => {
    const storage = createMMKV({ id: 'user-storage' });
    const saved = storage.getString('applicationLangCode');
    if (isSupported(saved)) return saved;

    const deviceLang = getLocales()[0]?.languageCode;
    if (isSupported(deviceLang)) return deviceLang;

    return 'en';
};

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: enTranslation },
        es: { translation: esTranslation },
        it: { translation: itTranslation },
        pl: { translation: plTranslation },
    },
    lng: resolveInitialLang(),
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
