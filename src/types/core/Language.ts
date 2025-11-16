export enum LanguageCode {
  ENGLISH = 'en',
  POLISH = 'pl',
  SPANISH = 'es',
  ITALIAN = 'it',
}

export type Language = {
  languageCode: LanguageCode;
  languageName: string;
  languageInTargetLanguage: string;
}