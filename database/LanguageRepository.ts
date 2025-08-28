import AsyncStorage from "@react-native-async-storage/async-storage";
import { LanguageCode } from "../store/types";

const MAIN_KEY = "mainLangCode";
const TRANSLATION_KEY = "translationLangCode";

export const getMainLang = async (): Promise<LanguageCode | null> => {
  const value = await AsyncStorage.getItem(MAIN_KEY);
  return value as LanguageCode | null;
};

export const setMainLang = async (lang: LanguageCode): Promise<void> => {
  await AsyncStorage.setItem(MAIN_KEY, lang);
};

export const getTranslationLang = async (): Promise<LanguageCode | null> => {
  const value = await AsyncStorage.getItem(TRANSLATION_KEY);
  return value as LanguageCode | null;
};

export const setTranslationLang = async (lang: LanguageCode): Promise<void> => {
  await AsyncStorage.setItem(TRANSLATION_KEY, lang);
};