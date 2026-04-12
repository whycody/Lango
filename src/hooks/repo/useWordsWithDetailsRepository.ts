import { getAllWordsWithDetails } from '../../database/WordsWithDetailsRepository';
import { useRepositoryUserId } from './useRepositoryUserId';

export const useWordsWithDetailsRepository = () => {
    const getUserId = useRepositoryUserId();

    return {
        getAllWordsWithDetails: () => getAllWordsWithDetails(getUserId()),
    };
};
