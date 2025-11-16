import { createContext, FC, ReactNode, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Language, LanguageCode } from "../types";
import { MAIN_LANG, TRANSLATION_LANG, useAppInitializer } from "./AppInitializerContext";
import { useTypedMMKV } from "../hooks/useTypedMKKV";
import { useUserStorage } from "./UserStorageContext";

interface LanguageContextProps {
  languages: Language[];
  mainLang: LanguageCode;
  translationLang: LanguageCode;
  applicationLang: LanguageCode;
  setMainLang: (langCode: LanguageCode) => void;
  setTranslationLang: (langCode: LanguageCode) => void;
  setApplicationLang: (langCode: LanguageCode) => void;
}

export const LanguageContext = createContext<LanguageContextProps>({
  languages: [],
  mainLang: LanguageCode.SPANISH,
  translationLang: LanguageCode.POLISH,
  applicationLang: LanguageCode.POLISH,
  setMainLang: () => {},
  setTranslationLang: () => {},
  setApplicationLang: () => {},
});

const APPLICATION_LANG = 'applicationLangCode';

const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const { initialLoad } = useAppInitializer();
  const { storage } = useUserStorage();
  const [mainLang, setMainLang] = useTypedMMKV<LanguageCode>(MAIN_LANG, initialLoad.mainLang, storage);
  const [translationLang, setTranslationLang] = useTypedMMKV<LanguageCode>(TRANSLATION_LANG, initialLoad.translationLang, storage);
  const [applicationLang, setApplicationLang] = useTypedMMKV<LanguageCode>(APPLICATION_LANG, initialLoad.translationLang, storage);

  const languages: Language[] = [
    { languageCode: LanguageCode.POLISH, languageName: t('polish'), languageInTargetLanguage: 'Polski' },
    { languageCode: LanguageCode.ENGLISH, languageName: t('english'), languageInTargetLanguage: 'English' },
    { languageCode: LanguageCode.SPANISH, languageName: t('spanish'), languageInTargetLanguage: 'Español' },
    { languageCode: LanguageCode.ITALIAN, languageName: t('italian'), languageInTargetLanguage: 'Italiano' },
  ];

  return (
    <LanguageContext.Provider value={{
      languages,
      mainLang,
      translationLang,
      applicationLang,
      setMainLang,
      setTranslationLang,
      setApplicationLang,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useSessions must be used within a SessionsProvider");
  }
  return context;
};

export default LanguageProvider;