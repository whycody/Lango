import { LanguageCode } from '../../constants/Language';
import { SyncMetadata } from '../sync/SyncMetadata';

export type WordsBundleVisibility = 'friends' | 'private' | 'public';

export type WordsBundleBase = {
    description?: string | null;
    id: string;
    mainLang: LanguageCode;
    ownerId: string;
    title: string;
    translationLang: LanguageCode;
    visibility: WordsBundleVisibility;
};

export type WordsBundle = WordsBundleBase &
    SyncMetadata & {
        bundleCreatedOnServer: boolean;
        removed: boolean;
        wordsBackfilled: boolean;
    };
