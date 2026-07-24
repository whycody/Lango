import {
    createTables,
    getAllWordsBundles,
    saveWordsBundles,
    updateWordsBundle,
} from '../../database/WordsBundleRepository';
import { WordsBundle } from '../../types';
import { useRepositoryUserId } from './useRepositoryUserId';

export const useWordsBundleRepository = () => {
    const getUserId = useRepositoryUserId();

    return {
        createTables: () => createTables(getUserId()),
        getAllWordsBundles: () => getAllWordsBundles(getUserId()),
        saveWordsBundles: (bundles: WordsBundle[]) => saveWordsBundles(getUserId(), bundles),
        updateWordsBundle: (bundle: WordsBundle) => updateWordsBundle(getUserId(), bundle),
    };
};
