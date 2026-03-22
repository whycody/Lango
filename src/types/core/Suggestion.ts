import { LanguageCode } from '../../constants/Language';
import { SyncMetadata } from '../sync/SyncMetadata';

export type Suggestion = Omit<SyncMetadata, 'updatedAt'> & {
    updatedAt: string;
} & {
    added: boolean;
    displayCount: number;
    id: string;
    mainLang: LanguageCode;
    skipped: boolean;
    translation: string;
    translationLang: LanguageCode;
    userId: string;
    word: string;
};
