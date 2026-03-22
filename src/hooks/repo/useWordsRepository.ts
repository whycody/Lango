import { createTables, getAllWords, saveWords, updateWord } from '../../database/WordsRepository';
import { useAuth } from '../../store/AuthContext';
import { Word } from '../../types';

export const useWordsRepository = () => {
    const { user } = useAuth();

    const getUserId = () => {
        if (!user?.userId) throw new Error('User not logged in');
        return user.userId;
    };

    return {
        createTables: () => createTables(getUserId()),
        getAllWords: () => getAllWords(getUserId()),
        saveWords: (words: Word[]) => saveWords(getUserId(), words),
        updateWord: (word: Word) => updateWord(getUserId(), word),
    };
};
