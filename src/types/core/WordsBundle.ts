import { LanguageCode } from '../../constants/Language';
import { SyncMetadata } from '../sync/SyncMetadata';

export type WordsBundleVisibility = 'friends' | 'private' | 'public';

export type WordsBundle = SyncMetadata & {
    bundleCreatedOnServer: boolean;
    description?: string;
    id: string;
    mainLang: LanguageCode;
    ownerId: string;
    removed: boolean;
    title: string;
    translationLang: LanguageCode;
    visibility: WordsBundleVisibility;
    wordsBackfilled: boolean;
};
