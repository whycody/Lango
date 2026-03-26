import { createTables, getAllWords, saveWords, updateWord } from '../../database/WordsRepository';
import { Word } from '../../types';
import { useRepositoryUserId } from './useRepositoryUserId';

export const useWordsRepository = () => {
    const getUserId = useRepositoryUserId();

    return {
        createTables: () => createTables(getUserId()),
        getAllWords: () => getAllWords(getUserId()),
        saveWords: (words: Word[]) => saveWords(getUserId(), words),
        updateWord: (word: Word) => updateWord(getUserId(), word),
    };
};
