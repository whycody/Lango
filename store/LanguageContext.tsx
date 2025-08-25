import { createContext, FC, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from "react-i18next";
import { Language, LanguageCode } from "./types";

interface LanguageContextProps {
  languages: Language[];
  mainLangCode: string;
  studyingLangCode: string;
  setMainLangCode: (langCode: string) => void;
  setStudyingLangCode: (langCode: string) => void;
}

export const LanguageContext = createContext<LanguageContextProps>({
  languages: [],
  mainLangCode: '',
  studyingLangCode: '',
  setMainLangCode: () => {},
  setStudyingLangCode: () => {},
});

const LanguageProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [mainLangCode, setMainLangCodeState] = useState<string>(LanguageCode.POLISH);
  const [studyingLangCode, setStudyingLangCodeState] = useState<string>(LanguageCode.SPANISH);

  const languages: Language[] = [
    { languageCode: LanguageCode.ENGLISH, languageName: t('english'), languageInTargetLanguage: 'English' },
    { languageCode: LanguageCode.SPANISH, languageName: t('spanish'), languageInTargetLanguage: 'Español' },
    { languageCode: LanguageCode.ITALIAN, languageName: t('italian'), languageInTargetLanguage: 'Italiano' },
  ];

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const storedMainLangCode = await AsyncStorage.getItem('mainLangCode');
        const storedStudyingLangCode = await AsyncStorage.getItem('studyingLangCode');

        if (storedMainLangCode) setMainLangCodeState(storedMainLangCode as LanguageCode);
        if (storedStudyingLangCode) setStudyingLangCodeState(storedStudyingLangCode as LanguageCode);
      } catch (error) {
        console.error("Failed to load languages from AsyncStorage", error);
      }
    };

    loadLanguages();
  }, []);

  const setMainLangCode = async (langCode: string) => {
    try {
      await AsyncStorage.setItem('mainLangCode', langCode);
      setMainLangCodeState(langCode);
    } catch (error) {
      console.error("Failed to save main language code", error);
    }
  };

  const setStudyingLangCode = async (langCode: string) => {
    try {
      await AsyncStorage.setItem('studyingLangCode', langCode);
      setStudyingLangCodeState(langCode);
    } catch (error) {
      console.error("Failed to save studying language code", error);
    }
  };

  return (
    <LanguageContext.Provider
      value={{ languages, mainLangCode, studyingLangCode, setMainLangCode, setStudyingLangCode }}>
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