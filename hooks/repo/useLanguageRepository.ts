import { getMainLang, getTranslationLang, setMainLang, setTranslationLang } from "../../database/LanguageRepository";

export const useLanguageRepository = () => {
  return {
    getTranslationLang: () => getTranslationLang(),
    getMainLang: () => getMainLang(),
    setTranslationLang: setTranslationLang,
    setMainLang: setMainLang,
  };
};