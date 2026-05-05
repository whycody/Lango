import { LanguageCode, SUPPORTED_LANGUAGE_CODES } from '../../constants/Language';

export type Language = {
    languageCode: LanguageCode;
    languageInTargetLanguage: string;
    languageName: string;
};

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGE_CODES)[number];
