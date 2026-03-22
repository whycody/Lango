import {
    createTables,
    getAllEvaluations,
    saveEvaluations,
} from '../../database/EvaluationsRepository';
import { useAuth } from '../../store/AuthContext';
import { Evaluation } from '../../types';

export const useEvaluationsRepository = () => {
    const { user } = useAuth();

    const getUserId = () => {
        if (!user?.userId) throw new Error('User not logged in');
        return user.userId;
    };

    return {
        createTables: () => createTables(getUserId()),
        getAllEvaluations: () => getAllEvaluations(getUserId()),
        saveEvaluations: (evaluations: Evaluation[]) => saveEvaluations(getUserId(), evaluations),
    };
};
