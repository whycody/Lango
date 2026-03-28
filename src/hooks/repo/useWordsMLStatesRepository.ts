import {
    createTables,
    getAllWordsMLStates,
    saveWordsMLStates,
    updateWordMLState,
} from '../../database/WordsMLStatesRepository';
import { WordsStatesRepository } from '../../database/WordsStatesRepository';
import { WordMLState } from '../../types';
import { useRepositoryUserId } from './useRepositoryUserId';

export const useWordsMLStatesRepository = (): WordsStatesRepository<WordMLState> => {
    const getUserId = useRepositoryUserId();

    return {
        createTables: () => createTables(getUserId()),
        getAllWordsStates: () => getAllWordsMLStates(getUserId()),
        save: items => saveWordsMLStates(getUserId(), items),
        update: item => updateWordMLState(getUserId(), item),
    };
};
