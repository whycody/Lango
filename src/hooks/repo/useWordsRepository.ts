import {
    createTables,
    deleteWordsByBundleId,
    deleteWordsByIds,
    getAllWords,
    saveWords,
    updateWord,
} from '../../database/WordsRepository';
import { Word } from '../../types';
import { useRepositoryUserId } from './useRepositoryUserId';

export const useWordsRepository = () => {
    const getUserId = useRepositoryUserId();

    return {
        createTables: () => createTables(getUserId()),
        deleteWordsByBundleId: (bundleId: string) => deleteWordsByBundleId(getUserId(), bundleId),
        deleteWordsByIds: (ids: string[]) => deleteWordsByIds(getUserId(), ids),
        getAllWords: () => getAllWords(getUserId()),
        saveWords: (words: Word[]) => saveWords(getUserId(), words),
        updateWord: (word: Word) => updateWord(getUserId(), word),
    };
};
