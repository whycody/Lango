import { SUPPORTED_LANGUAGE_CODES } from '../constants/Language';
import { SupportedLanguageCode } from '../types';

export const isSupportedLanguageCode = (lang: string | undefined): lang is SupportedLanguageCode =>
    !!lang && (SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(lang);
