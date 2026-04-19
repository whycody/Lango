import { createContext, FC, ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useMMKV } from 'react-native-mmkv';

import { LanguageCode } from '../constants/Language';
import { useTypedMMKV } from '../hooks/useTypedMKKV';
import { Language } from '../types';
import { MAIN_LANG, TRANSLATION_LANG } from './AppInitializerContext';
import { useAuth } from './AuthContext';
import { useUserStorage } from './UserStorageContext';

interface LanguageContextProps {
    applicationLang: LanguageCode;
    languages: Language[];
    mainLang: LanguageCode;
    setApplicationLang: (langCode: LanguageCode) => void;
    setMainLang: (langCode: LanguageCode) => void;
    setTranslationLang: (langCode: LanguageCode) => void;
    translationLang: LanguageCode;
}

export const LanguageContext = createContext<LanguageContextProps>({
    applicationLang: LanguageCode.POLISH,
    languages: [],
    mainLang: LanguageCode.SPANISH,
    setApplicationLang: () => {},
    setMainLang: () => {},
    setTranslationLang: () => {},
    translationLang: LanguageCode.POLISH,
});

export const APPLICATION_LANG = 'applicationLangCode';

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { i18n, t } = useTranslation();
    const { user } = useAuth();
    const userStorage = useUserStorage();
    const fallbackStorage = useMMKV({ id: 'user-storage' });
    const storage = userStorage.storage ?? fallbackStorage;
    const userMainLang = user?.mainLang ?? ('' as LanguageCode);
    const userTranslationLang = user?.translationLang ?? ('' as LanguageCode);
    const [mainLang, setMainLang] = useTypedMMKV<LanguageCode>(MAIN_LANG, userMainLang, storage);
    const [translationLang, setTranslationLang] = useTypedMMKV<LanguageCode>(
        TRANSLATION_LANG,
        userTranslationLang,
        storage,
    );
    const [applicationLang, setApplicationLangRaw] = useTypedMMKV<LanguageCode>(
        APPLICATION_LANG,
        i18n.language as LanguageCode,
        fallbackStorage,
    );

    const setApplicationLang = (langCode: LanguageCode) => {
        setApplicationLangRaw(langCode);
        i18n.changeLanguage(langCode);
    };

    const languages: Language[] = [
        {
            languageCode: LanguageCode.POLISH,
            languageInTargetLanguage: 'Polski',
            languageName: t('polish'),
        },
        {
            languageCode: LanguageCode.ENGLISH,
            languageInTargetLanguage: 'English',
            languageName: t('english'),
        },
        {
            languageCode: LanguageCode.SPANISH,
            languageInTargetLanguage: 'Español',
            languageName: t('spanish'),
        },
        {
            languageCode: LanguageCode.ITALIAN,
            languageInTargetLanguage: 'Italiano',
            languageName: t('italian'),
        },
    ];

    return (
        <LanguageContext.Provider
            value={{
                applicationLang,
                languages,
                mainLang,
                setApplicationLang,
                setMainLang,
                setTranslationLang,
                translationLang,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextProps => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useSessions must be used within a SessionsProvider');
    }
    return context;
};
