import {
    createTables,
    getAllWordsMLStates,
    saveWordsMLStates,
    updateWordMLState,
} from '../../database/WordsMLStatesRepository';
import { WordsStatesRepository } from '../../database/WordsStatesRepository';
import { useAuth } from '../../store';
import { WordMLState } from '../../types';

export const useWordsMLStatesRepository = (): WordsStatesRepository<WordMLState> => {
    const { user } = useAuth();

    const getUserId = () => {
        if (!user?.userId) throw new Error('User not logged in');
        return user.userId;
    };

    return {
        createTables: () => createTables(getUserId()),
        getAllWordsStates: () => getAllWordsMLStates(getUserId()),
        save: items => saveWordsMLStates(getUserId(), items),
        update: item => updateWordMLState(getUserId(), item),
    };
};
