import { BundleMemberWithUser } from '../../../types';
import { normalizeForSearch } from '../../../utils/helpers';
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
    const normalizedQuery = normalizeForSearch(query.trim());
    const filtered = normalizedQuery
        ? members.filter(member =>
              normalizeForSearch(member.userSummary.name).includes(normalizedQuery),
          )
        : members;

    return filtered
        .slice()
        .sort((a, b) => MEMBER_ROLE_SORT_ORDER[a.role] - MEMBER_ROLE_SORT_ORDER[b.role]);
};
