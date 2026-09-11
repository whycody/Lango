import { ApiErrorCode } from '../../api/api.types';
import { LanguageCode } from '../../constants/Language';
import { SyncMetadata } from '../sync/SyncMetadata';
import { UserSummary } from './user-summary';

export type WordsBundleVisibility = 'friends' | 'private' | 'public';

export type WordsBundleBase = {
    description?: string | null;
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
    joinedViaCodeId?: string;
    removed: boolean;
    role: BundleMemberRole;
    subscribed: boolean;
    userId: string;
};

export type BundleMemberWithUser = BundleMember & {
    userSummary: UserSummary;
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
