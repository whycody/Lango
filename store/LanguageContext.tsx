import { createContext, FC, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from "react-i18next";

export type Language = {
  languageCode: LanguageCode;
  languageName: string;
  languageInTargetLanguage: string;
}

export enum LanguageCode {
  ENGLISH = 'eng',
  POLISH = 'pl',
  SPANISH = 'es',
  ITALIAN = 'it',
}

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

export const LanguageProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [mainLangCode, setMainLangCodeState] = useState(LanguageCode.POLISH);
  const [studyingLangCode, setStudyingLangCodeState] = useState(LanguageCode.SPANISH);

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