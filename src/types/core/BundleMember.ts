import { SyncMetadata } from '../sync/SyncMetadata';

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
