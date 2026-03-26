import {
    createTables,
    deleteSuggestions,
    getAllSuggestions,
    saveSuggestions,
} from '../../database/SuggestionsRepository';
import { Suggestion } from '../../types';
import { useRepositoryUserId } from './useRepositoryUserId';

export const useSuggestionsRepository = () => {
    const getUserId = useRepositoryUserId();

    return {
        createTables: () => createTables(getUserId()),
        deleteSuggestions: (ids: string[]) => deleteSuggestions(getUserId(), ids),
        getAllSuggestions: () => getAllSuggestions(getUserId()),
        saveSuggestions: (suggestions: Suggestion[]) => saveSuggestions(getUserId(), suggestions),
    };
};
