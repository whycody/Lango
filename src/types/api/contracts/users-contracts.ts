import { LanguageCode } from '../../../constants/Language';
import { LanguageLevel, LanguageLevelRange } from '../../core/User';

export type UpdateUserDataRequest = {
    level: LanguageLevelRange;
    mainLang: LanguageCode;
    selectedFlashcardsIds: string[];
    skippedFlashcardsIds: string[];
    translationLang: LanguageCode;
};

export type UpdateSuggestionsInSessionRequest = {
    enabled: boolean;
};

export type UpdateFinishedOnboardingRequest = {
    finished: boolean;
};

export type UpdateNotificationsEnabledRequest = {
    enabled: boolean;
};

export type UpdateLanguageLevelsRequest = {
    languageLevels: LanguageLevel[];
};
