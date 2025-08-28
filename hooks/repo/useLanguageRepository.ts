import { getTranslationLang, getMainLang, setTranslationLang, setMainLang } from "../../database/LanguageRepository";

export const useLanguageRepository = () => {
  return {
    getTranslationLang: () => getTranslationLang(),
    getMainLang: () => getMainLang(),
    setTranslationLang: setTranslationLang,
    setMainLang: setMainLang,
  };
};