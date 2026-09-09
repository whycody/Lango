import { LanguageCode } from '../../../constants/Language';
import { LanguageLevelRange } from '../../core/User';

export type FetchExampleFlashcardsParams = {
    count: number;
    level: LanguageLevelRange;
    mainLang: LanguageCode;
    translationLang: LanguageCode;
};
