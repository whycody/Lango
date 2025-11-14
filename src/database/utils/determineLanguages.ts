import * as RNLocalize from 'react-native-localize';
import { LanguageCode, User } from "../../types";

export const determineLanguages = async (user?: User) => {
  let mainLang = user?.mainLang ?? null;
  let translationLang = user?.translationLang ?? null;

  let deviceLang: string | undefined;
  if (RNLocalize && RNLocalize.getLocales) {
    deviceLang = RNLocalize.getLocales()[0]?.languageCode?.toLowerCase();
  }

  if (!mainLang) mainLang = LanguageCode.ENGLISH;

  if (!translationLang) {
    if (deviceLang && Object.values(LanguageCode).includes(deviceLang as LanguageCode)) {
      translationLang = deviceLang as LanguageCode;
    } else {
      translationLang = mainLang === LanguageCode.ENGLISH ? LanguageCode.SPANISH : LanguageCode.ENGLISH;
    }
  }

  return { mainLang, translationLang };
};