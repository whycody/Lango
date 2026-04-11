import { LanguageCode } from '../../constants/Language';
import { WordSource } from '../../constants/Word';
import { SyncMetadata } from '../sync/SyncMetadata';
import { SuggestionExample } from './Suggestion';

export type Word = SyncMetadata & {
    active: boolean;
    addDate: string;
    id: string;
    mainLang: LanguageCode;
    removed: boolean;
    source: WordSource;
    text: string;
    translation: string;
    translationLang: LanguageCode;
};

export type SessionWord = {
    addDate: string;
    id: string;
    mainLang: LanguageCode;
    tags: WordTag[];
    text: string;
    translation: string;
    translationLang: LanguageCode;
    type: 'suggestion' | 'word';
    example: SuggestionExample | null;
};

export type WordTag =
    | 'streak'
    | 'improving'
    | 'in_progress'
    | 'recently_added'
    | 'long_time_no_see'
    | 'frequently_repeated'
    | 'well_known'
    | 'often_mistaken'
    | 'struggling';
