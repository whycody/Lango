import { getAllWordsWithDetails } from '../../database/WordsWithDetailsRepository';
import { useAuth } from '../../store';

export const useWordsWithDetailsRepository = () => {
    const userId = useAuth().user.userId;

    if (!userId) throw new Error('User not logged in');

    return {
        getAllWordsWithDetails: () => getAllWordsWithDetails(userId),
    };
};
