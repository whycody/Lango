import { BundleMemberRole } from './BundleMember';

export type BundleJoinCode = {
    bundleId: string;
    code: string;
    expireAt: string;
    id: string;
    role: BundleMemberRole;
};
