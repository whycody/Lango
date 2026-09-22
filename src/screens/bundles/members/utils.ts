import { BundleMemberWithUser } from '../../../types';
import { MEMBER_ROLE_SORT_ORDER } from './constants';

export const isBundleOwnerStale = (
    members: BundleMemberWithUser[],
    localOwnerId: string | undefined,
): boolean => {
    const serverOwnerId = members.find(member => member.role === 'owner')?.userId;
    return !!serverOwnerId && serverOwnerId !== localOwnerId;
};

export const filterAndSortMembers = (
    members: BundleMemberWithUser[],
    query: string,
): BundleMemberWithUser[] => {
    const trimmedQuery = query.trim().toLowerCase();
    const filtered = trimmedQuery
        ? members.filter(member => member.userSummary.name.toLowerCase().includes(trimmedQuery))
        : members;

    return filtered
        .slice()
        .sort((a, b) => MEMBER_ROLE_SORT_ORDER[a.role] - MEMBER_ROLE_SORT_ORDER[b.role]);
};
