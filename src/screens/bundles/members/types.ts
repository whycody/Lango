import { BundleMemberRole, BundleMemberWithUser } from '../../../types';

export type AssignableMemberRole = Extract<BundleMemberRole, 'editor' | 'viewer'>;

export type MemberAction = 'grant-edit' | 'revoke-edit' | 'transfer-ownership';

export type MembersListRow =
    | { id: 'header'; type: 'header' }
    | { id: 'filter'; type: 'filter' }
    | { id: 'emptyList'; type: 'emptyList' }
    | { id: 'skeleton'; type: 'skeleton' }
    | { isFirst: boolean; member: BundleMemberWithUser; type: 'member' };
