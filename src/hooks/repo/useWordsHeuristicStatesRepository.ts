import {
    createHeuristicTable,
    getAllWordsHeuristicStates,
    saveWordsHeuristicStates,
    updateWordHeuristicState,
} from '../../database/WordsHeuristicStatesRepository';
import { WordsStatesRepository } from '../../database/WordsStatesRepository';
import { WordHeuristicState } from '../../types';
import { useRepositoryUserId } from './useRepositoryUserId';

export const useWordsHeuristicStatesRepository = (): WordsStatesRepository<WordHeuristicState> => {
    const getUserId = useRepositoryUserId();

    return {
        createTables: () => createHeuristicTable(getUserId()),
        getAllWordsStates: () => getAllWordsHeuristicStates(getUserId()),
        save: items => saveWordsHeuristicStates(getUserId(), items),
        update: item => updateWordHeuristicState(getUserId(), item),
    };
};
