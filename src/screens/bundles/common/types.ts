import { BundleMemberRole } from '../../../types';

export type InviteRole = Extract<BundleMemberRole, 'editor' | 'viewer'>;
