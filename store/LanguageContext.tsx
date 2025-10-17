import { createContext, FC, ReactNode, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Language, LanguageCode } from "./types";
import { useLanguageRepository } from "../hooks/repo/useLanguageRepository";
import { useAppInitializer } from "./AppInitializerContext";

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
  const { setMainLang, setTranslationLang } = useLanguageRepository();
  const [mainLangState, setMainLangState] = useState<LanguageCode>(initialLoad.mainLang);
  const [translationLangState, setTranslationLangState] = useState<LanguageCode>(initialLoad.translationLang);

  const updateMainLang = async (langCode: LanguageCode) => {
    await setMainLang(langCode);
    setMainLangState(langCode);
  }

  const updateTranslationLang = async (langCode: LanguageCode) => {
    await setTranslationLang(langCode);
    setTranslationLangState(langCode);
  }

  const languages: Language[] = [
    { languageCode: LanguageCode.ENGLISH, languageName: t('english'), languageInTargetLanguage: 'English' },
    { languageCode: LanguageCode.SPANISH, languageName: t('spanish'), languageInTargetLanguage: 'Español' },
    { languageCode: LanguageCode.ITALIAN, languageName: t('italian'), languageInTargetLanguage: 'Italiano' },
  ];

  return (
    <LanguageContext.Provider value={{
      languages,
      mainLang: mainLangState,
      translationLang: translationLangState,
      setMainLang: updateMainLang,
      setTranslationLang: updateTranslationLang
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