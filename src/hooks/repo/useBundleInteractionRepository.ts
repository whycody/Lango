import {
    createTables,
    deleteBundleInteractionsByIds,
    getAllBundleInteractions,
    saveBundleInteractions,
    updateBundleInteraction,
} from '../../database/BundleInteractionRepository';
import { BundleInteraction } from '../../types';
import { useRepositoryUserId } from './useRepositoryUserId';

export const useBundleInteractionRepository = () => {
    const getUserId = useRepositoryUserId();

    return {
        createTables: () => createTables(getUserId()),
        deleteBundleInteractionsByIds: (ids: string[]) =>
            deleteBundleInteractionsByIds(getUserId(), ids),
        getAllBundleInteractions: () => getAllBundleInteractions(getUserId()),
        saveBundleInteractions: (interactions: BundleInteraction[]) =>
            saveBundleInteractions(getUserId(), interactions),
        updateBundleInteraction: (interaction: BundleInteraction) =>
            updateBundleInteraction(getUserId(), interaction),
    };
};
