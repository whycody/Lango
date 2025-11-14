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
  setMainLang: (langCode: LanguageCode) => void;
  setTranslationLang: (langCode: LanguageCode) => void;
}

export const LanguageContext = createContext<LanguageContextProps>({
  languages: [],
  mainLang: LanguageCode.SPANISH,
  translationLang: LanguageCode.POLISH,
  setMainLang: () => {},
  setTranslationLang: () => {},
});

const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const { initialLoad } = useAppInitializer();
  const { storage } = useUserStorage();
  const [mainLang, setMainLang] = useTypedMMKV<LanguageCode>(MAIN_LANG, initialLoad.mainLang, storage);
  const [translationLang, setTranslationLang] = useTypedMMKV<LanguageCode>(TRANSLATION_LANG, initialLoad.translationLang, storage);

  const languages: Language[] = [
    { languageCode: LanguageCode.ENGLISH, languageName: t('english'), languageInTargetLanguage: 'English' },
    { languageCode: LanguageCode.SPANISH, languageName: t('spanish'), languageInTargetLanguage: 'Español' },
    { languageCode: LanguageCode.ITALIAN, languageName: t('italian'), languageInTargetLanguage: 'Italiano' },
  ];

  return (
    <LanguageContext.Provider value={{
      languages,
      mainLang,
      translationLang,
      setMainLang,
      setTranslationLang
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