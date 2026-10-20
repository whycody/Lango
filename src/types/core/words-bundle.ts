import { ApiErrorCode } from '../../api/api.types';
import { LanguageCode } from '../../constants/Language';
import { SyncMetadata } from '../sync/SyncMetadata';
import { UserSummary } from './user-summary';

export type WordsBundleVisibility = 'friends' | 'private' | 'public';

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// Set only by the server (theme bundles created by admin). Read and stored locally, but never
// sent in sync. A missing field means "not applicable": treat `premiumOnly` as `false` and
// `wordsGenerated` as `true` by default.
export type WordsBundleServerFields = {
    category?: string | null;
    level?: CefrLevel | null;
    premiumOnly?: boolean;
    wordsGenerated?: boolean;
};

export type WordsBundleBase = WordsBundleServerFields & {
    description: string | null;
    id: string;
    mainLang: LanguageCode;
    ownerId: string;
    title: string;
    translationLang: LanguageCode;
    visibility: WordsBundleVisibility;
    removed: boolean;
};

export type WordsBundle = WordsBundleBase &
    SyncMetadata & {
        bundleCreatedOnServer: boolean;
        wordsBackfilled: boolean;
    };

export type WordsBundleWithOwnerInfo = WordsBundle & {
    flashcardsCount: number;
    ownerName: string;
    ownerPicture?: string;
};

export type BundleMemberRole = 'editor' | 'owner' | 'viewer';

export type BundleMember = SyncMetadata & {
    bundleId: string;
    id: string;
    removed: boolean;
    role: BundleMemberRole;
    subscribed: boolean;
    userId: string;
};

export type BundleMemberWithUser = BundleMember & {
    userSummary: UserSummary;
};

export type BundleInteraction = SyncMetadata & {
    bundleId: string;
    id: string;
    interactedAt: string;
    userId: string;
};

export type BundleJoinCode = {
    bundleId: string;
    code: string;
    expireAt: string;
    id: string;
    role: BundleMemberRole;
};

export type JoinBundleWithCodeResult = {
    bundle: WordsBundle;
    member: BundleMember;
};

export type JoinBundleWithCodeStoreResult =
    | { member: BundleMember; success: true }
    | { errorCode: ApiErrorCode; success: false };

export type DeleteBundleResult = { success: true } | { errorCode: ApiErrorCode; success: false };

export type BundleSearchResponse = {
    data: WordsBundleWithOwnerInfo[];
    total: number;
};
