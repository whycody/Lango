import { BundleMemberRole } from '../types/core/words-bundle';

export const hasBundleEditPermission = (role: BundleMemberRole | undefined): boolean =>
    role === 'owner' || role === 'editor';
