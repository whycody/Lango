import {
    createHeuristicTable,
    getAllWordsHeuristicStates,
    saveWordsHeuristicStates,
    updateWordHeuristicState,
} from '../../database/WordsHeuristicStatesRepository';
import { WordsStatesRepository } from '../../database/WordsStatesRepository';
import { useAuth } from '../../store';
import { WordHeuristicState } from '../../types';

export const useWordsHeuristicStatesRepository = (): WordsStatesRepository<WordHeuristicState> => {
    const { user } = useAuth();

    const getUserId = () => {
        if (!user?.userId) throw new Error('User not logged in');
        return user.userId;
    };

    return {
        createTables: () => createHeuristicTable(getUserId()),
        getAllWordsStates: () => getAllWordsHeuristicStates(getUserId()),
        save: items => saveWordsHeuristicStates(getUserId(), items),
        update: item => updateWordHeuristicState(getUserId(), item),
    };
};
