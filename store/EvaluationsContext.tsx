import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import { useEvaluationsRepository } from "../hooks/useEvaluationsRepository";
import { fetchUpdatedEvaluations, syncEvaluationsOnServer } from "../hooks/useApi";
import uuid from 'react-native-uuid';

export interface Evaluation {
  id: string;
  wordId: string;
  sessionId: string;
  grade: number;
  date: string;
  synced: boolean;
  updatedAt?: string;
  locallyUpdatedAt: string;
}

interface EvaluationsContextProps {
  evaluations: Evaluation[];
  loading: boolean;
  addEvaluations: (evaluationsData: { wordId: string, sessionId: string, grade: number }[]) => Evaluation[];
  getEvaluation: (id: string) => Evaluation | undefined;
  syncEvaluations: () => Promise<void>;
}

export const EvaluationsContext = createContext<EvaluationsContextProps>({
  evaluations: [],
  loading: true,
  addEvaluations: () => [],
  getEvaluation: () => undefined,
  syncEvaluations: () => Promise.resolve(),
});

export const EvaluationsProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAllEvaluations, saveEvaluations, createTables } = useEvaluationsRepository();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  const createEvaluation = (wordId: string, sessionId: string, grade: number): Evaluation => {
    const now = new Date().toISOString();
    return {
      id: uuid.v4(),
      wordId,
      sessionId,
      grade,
      date: now,
      synced: false,
      updatedAt: now,
      locallyUpdatedAt: now,
    };
  };

  const addEvaluations = (evaluationsData: { wordId: string, sessionId: string, grade: number }[]) => {
    const newEvaluations = evaluationsData.map(({ wordId, sessionId, grade }) =>
      createEvaluation(wordId, sessionId, grade)
    );

    const updatedEvaluations = [...newEvaluations, ...evaluations];
    setEvaluations(updatedEvaluations);
    saveEvaluations(newEvaluations);
    syncEvaluations(updatedEvaluations);
    return newEvaluations;
  };

  const getEvaluation = (id: string): Evaluation | undefined => {
    return evaluations.find(evaluation => evaluation.id === id);
  };

  const syncEvaluations = async (inputEvaluations?: Evaluation[]) => {
    try {
      const evaluationsList = inputEvaluations ?? (await getAllEvaluations());
      const unsyncedEvaluations = getUnsyncedEvaluations(evaluationsList);
      const serverUpdates = await syncUnsyncedEvaluations(unsyncedEvaluations);

      if (!serverUpdates) return;

      const mergedEvaluations = await mergeEvaluations(evaluationsList, serverUpdates);
      const changedEvaluations = findChangedEvaluations(evaluationsList, mergedEvaluations);

      if (changedEvaluations.length > 0) {
        setEvaluations(mergedEvaluations);
        await saveEvaluations(changedEvaluations);
      }
    } catch (error) {
      console.log("Error syncing evaluations:", error);
    }
  };

  const getUnsyncedEvaluations = (evaluations: Evaluation[]): Evaluation[] => {
    return evaluations.filter(evaluation => !evaluation.synced);
  };

  const syncUnsyncedEvaluations = async (unsyncedEvaluations: Evaluation[]): Promise<{ id: string, updatedAt: string }[]> => {
    if (unsyncedEvaluations.length === 0) return [];
    const result = await syncEvaluationsOnServer(unsyncedEvaluations) as { id: string, updatedAt: string }[] | null;
    return result ?? [];
  };

  const mergeEvaluations = async (localEvaluations: Evaluation[], serverUpdates: {
    id: string,
    updatedAt: string
  }[]) => {
    const updatesMap = new Map(serverUpdates.map(update => [update.id, update.updatedAt]));
    const updatedLocalEvaluations = updateLocalEvaluations(localEvaluations, updatesMap);
    const latestUpdatedAt = findLatestUpdatedAt(updatedLocalEvaluations);
    const serverEvaluations = await fetchUpdatedEvaluations(latestUpdatedAt);

    return mergeLocalAndServerEvaluations(updatedLocalEvaluations, serverEvaluations);
  };

  const updateLocalEvaluations = (evaluations: Evaluation[], updatesMap: Map<string, string>): Evaluation[] => {
    return evaluations.map(evaluation => {
      if (updatesMap.has(evaluation.id)) {
        return {
          ...evaluation,
          synced: true,
          updatedAt: updatesMap.get(evaluation.id) as string,
        };
      }
      return evaluation;
    });
  };

  const findLatestUpdatedAt = (evaluations: Evaluation[]): string => {
    return new Date(
      Math.max(...evaluations.map(evaluation => new Date(evaluation.updatedAt || evaluation.date).getTime()), 0)
    ).toISOString();
  };

  const mergeLocalAndServerEvaluations = (localEvaluations: Evaluation[], serverEvaluations: Evaluation[]): Evaluation[] => {
    const serverEvaluationsMap = new Map(serverEvaluations.map(se => [se.id, se]));
    const existingIds = new Set(localEvaluations.map(e => e.id));

    const mergedEvaluations = localEvaluations.map(localEval => {
      if (serverEvaluationsMap.has(localEval.id)) {
        const serverEval = serverEvaluationsMap.get(localEval.id)!;
        const localDate = new Date(localEval.updatedAt || localEval.date).getTime();
        const serverDate = new Date(serverEval.updatedAt || serverEval.date).getTime();

        if (serverDate > localDate) {
          return {
            ...serverEval,
            synced: true,
            updatedAt: serverEval.updatedAt,
          };
        } else {
          return localEval;
        }
      }
      return localEval;
    });

    const newEvaluations = serverEvaluations.filter(se => !existingIds.has(se.id)).map(se => ({
      ...se,
      synced: true,
      updatedAt: se.updatedAt,
    }));

    return [...mergedEvaluations, ...newEvaluations];
  };


  const findChangedEvaluations = (originalEvaluations: Evaluation[], finalEvaluations: Evaluation[]): Evaluation[] => {
    const originalMap = new Map(originalEvaluations.map(e => [e.id, e]));

    return finalEvaluations.filter(evaluation => {
      const original = originalMap.get(evaluation.id);
      if (!original) return true;
      return original.synced !== evaluation.synced || original.updatedAt !== evaluation.updatedAt;
    });
  };

  const loadEvaluations = async () => {
    try {
      const loadedEvaluations = await getAllEvaluations();
      syncEvaluations(loadedEvaluations);
      setEvaluations(loadedEvaluations);
    } catch (error) {
      console.log('Error loading words from storage:', error);
    }
  }

  const loadData = async () => {
    try {
      setLoading(true);
      await createTables();
      await loadEvaluations();
      setLoading(false);
    } catch (error) {
      console.log('Error loading evaluations from storage:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <EvaluationsContext.Provider value={{ evaluations, loading, addEvaluations, getEvaluation, syncEvaluations }}>
      {children}
    </EvaluationsContext.Provider>
  );
};

export const useEvaluations = (): EvaluationsContextProps => {
  const context = useContext(EvaluationsContext);
  if (!context) {
    throw new Error("useEvaluations must be used within an EvaluationsProvider");
  }
  return context;
};

export default EvaluationsProvider;