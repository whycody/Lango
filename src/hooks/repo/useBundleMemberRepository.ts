import {
    createTables,
    deleteBundleMembersByIds,
    getAllBundleMembers,
    saveBundleMembers,
    updateBundleMember,
} from '../../database/BundleMemberRepository';
import { BundleMember } from '../../types';
import { useRepositoryUserId } from './useRepositoryUserId';

export const useBundleMemberRepository = () => {
    const getUserId = useRepositoryUserId();

    return {
        createTables: () => createTables(getUserId()),
        deleteBundleMembersByIds: (ids: string[]) => deleteBundleMembersByIds(getUserId(), ids),
        getAllBundleMembers: () => getAllBundleMembers(getUserId()),
        saveBundleMembers: (members: BundleMember[]) => saveBundleMembers(getUserId(), members),
        updateBundleMember: (member: BundleMember) => updateBundleMember(getUserId(), member),
    };
};
