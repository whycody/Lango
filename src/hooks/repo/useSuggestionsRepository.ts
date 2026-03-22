import {
    createTables,
    deleteSuggestions,
    getAllSuggestions,
    saveSuggestions,
} from '../../database/SuggestionsRepository';
import { useAuth } from '../../store';
import { Suggestion } from '../../types';

export const useSuggestionsRepository = () => {
    const { user } = useAuth();

    const getUserId = () => {
        if (!user?.userId) throw new Error('User not logged in');
        return user.userId;
    };

    return {
        createTables: () => createTables(getUserId()),
        deleteSuggestions: (ids: string[]) => deleteSuggestions(getUserId(), ids),
        getAllSuggestions: () => getAllSuggestions(getUserId()),
        saveSuggestions: (suggestions: Suggestion[]) => saveSuggestions(getUserId(), suggestions),
    };
};
