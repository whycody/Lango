import {
    createTables,
    getAllEvaluations,
    saveEvaluations,
} from '../../database/EvaluationsRepository';
import { Evaluation } from '../../types';
import { useRepositoryUserId } from './useRepositoryUserId';

export const useEvaluationsRepository = () => {
    const getUserId = useRepositoryUserId();

    return {
        createTables: () => createTables(getUserId()),
        getAllEvaluations: () => getAllEvaluations(getUserId()),
        saveEvaluations: (evaluations: Evaluation[]) => saveEvaluations(getUserId(), evaluations),
    };
};
