import React, {
    createContext,
    FC,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import uuid from 'react-native-uuid';

import { fetchUpdatedEvaluations, syncEvaluationsOnServer } from '../api/apiClient';
import { EvaluationGrade } from '../constants/Evaluation';
import { useEvaluationsRepository } from '../hooks';
import { Evaluation } from '../types';
import {
    findChangedItems,
    findLatestUpdatedAt,
    getUnsyncedItems,
    mergeLocalAndServer,
    syncInBatches,
    updateLocalItems,
} from '../utils/sync';
import { useAppInitializer } from '.';

interface EvaluationsContextProps {
    addEvaluations: (
        evaluationsData: { grade: number; sessionId: string; wordId: string }[],
    ) => Evaluation[];
    evaluations: Evaluation[] | null;
    loading: boolean;
    syncEvaluations: () => Promise<void>;
}

export const EvaluationsContext = createContext<EvaluationsContextProps>({
    addEvaluations: () => [],
    evaluations: [],
    loading: true,
    syncEvaluations: () => Promise.resolve(),
});

export const EvaluationsProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { initialLoad } = useAppInitializer();
    const { getAllEvaluations, saveEvaluations } = useEvaluationsRepository();
    const [evaluations, setEvaluations] = useState<Evaluation[]>(initialLoad.evaluations);
    const [loading, setLoading] = useState(true);
    const syncing = useRef(false);

    const createEvaluation = (
        wordId: string,
        sessionId: string,
        grade: EvaluationGrade,
    ): Evaluation => {
        const now = new Date().toISOString();
        return {
            date: now,
            grade,
            id: uuid.v4(),
            locallyUpdatedAt: now,
            sessionId,
            synced: false,
            updatedAt: now,
            wordId,
        };
    };

    const addEvaluations = (
        evaluationsData: {
            grade: EvaluationGrade;
            sessionId: string;
            wordId: string;
        }[],
    ) => {
        const newEvaluations = evaluationsData.map(({ grade, sessionId, wordId }) =>
            createEvaluation(wordId, sessionId, grade),
        );

        const updatedEvaluations = [...newEvaluations, ...evaluations];
        setEvaluations(updatedEvaluations);
        saveEvaluations(newEvaluations);
        syncEvaluations(updatedEvaluations);
        return newEvaluations;
    };

    const syncEvaluations = async (inputEvaluations?: Evaluation[]) => {
        try {
            if (syncing.current) return;
            syncing.current = true;
            const evaluationsList = inputEvaluations ?? (await getAllEvaluations());
            const unsyncedEvaluations = getUnsyncedItems<Evaluation>(evaluationsList);
            const serverUpdates = await syncInBatches<Evaluation>(
                unsyncedEvaluations,
                syncEvaluationsOnServer,
            );

            const updatedEvaluations = updateLocalItems<Evaluation>(evaluationsList, serverUpdates);
            const serverEvaluations = await fetchNewEvaluations(updatedEvaluations);
            const mergedEvaluations = mergeLocalAndServer<Evaluation>(
                updatedEvaluations,
                serverEvaluations,
            );
            const changedEvaluations = findChangedItems<Evaluation>(
                evaluationsList,
                mergedEvaluations,
            );

            if (changedEvaluations.length > 0) {
                setEvaluations(mergedEvaluations);
                await saveEvaluations(changedEvaluations);
            }
        } catch (error) {
            console.log('Error syncing evaluations:', error);
        } finally {
            syncing.current = false;
        }
    };

    const fetchNewEvaluations = async (updatedEvaluations: Evaluation[]): Promise<Evaluation[]> => {
        const latestUpdatedAt = findLatestUpdatedAt<Evaluation>(updatedEvaluations);
        return await fetchUpdatedEvaluations(latestUpdatedAt);
    };

    const loadData = async () => {
        try {
            setLoading(true);
            await syncEvaluations();
        } catch (error) {
            console.log('Error loading evaluations from storage:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <EvaluationsContext.Provider
            value={{ addEvaluations, evaluations, loading, syncEvaluations }}
        >
            {children}
        </EvaluationsContext.Provider>
    );
};

export const useEvaluations = (): EvaluationsContextProps => {
    const context = useContext(EvaluationsContext);
    if (!context) {
        throw new Error('useEvaluations must be used within an EvaluationsProvider');
    }
    return context;
};
