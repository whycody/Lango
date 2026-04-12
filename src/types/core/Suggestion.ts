import { LanguageCode } from '../../constants/Language';
import { SyncMetadata } from '../sync/SyncMetadata';

export type SuggestionExample = {
    source: string;
    target: string;
};

export type Suggestion = Omit<SyncMetadata, 'updatedAt'> & {
    updatedAt: string;
} & {
    added: boolean;
    displayCount: number;
    example: SuggestionExample | null;
    id: string;
    mainLang: LanguageCode;
    skipped: boolean;
    translation: string;
    translationLang: LanguageCode;
    userId: string;
    word: string;
};
