import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import { useEvaluationsRepository } from "../hooks/useEvaluationsRepository";
import { syncEvaluationsOnServer } from "../hooks/useApi";
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
  syncEvaluations: () => Promise<void>;
}

export const EvaluationsContext = createContext<EvaluationsContextProps>({
  evaluations: [],
  loading: true,
  addEvaluations: () => [],
  syncEvaluations: () => Promise.resolve(),
});

export const EvaluationsProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAllEvaluations, deleteEvaluations, saveEvaluations, createTables } = useEvaluationsRepository();
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

  const syncEvaluations = async (inputEvaluations?: Evaluation[]) => {
    try {
      const evaluationsList = inputEvaluations ?? (await getAllEvaluations());
      const unsyncedEvaluations = getUnsyncedEvaluations(evaluationsList);
      const serverUpdates = await syncUnsyncedEvaluations(unsyncedEvaluations);

      if (!serverUpdates) return;

      const updatedLocalEvaluations = updateLocalEvaluations(evaluationsList, new Map(serverUpdates.map(update => [update.id, update.updatedAt])));
      const locallyKeptEvaluations = updatedLocalEvaluations.filter(evaluation => !evaluation.synced);
      const evaluationsToRemove = updatedLocalEvaluations.filter(evaluation => evaluation.synced);

      if (evaluationsToRemove.length > 0) {
        await deleteEvaluations(evaluationsToRemove.map(e => e.id));
        setEvaluations(locallyKeptEvaluations);
      }
    } catch (error) {
      console.log("Error syncing evaluations:", error);
    }
  };

  const getUnsyncedEvaluations = (evaluations: Evaluation[]): Evaluation[] => {
    return evaluations.filter(evaluation => !evaluation.synced);
  };

  const syncUnsyncedEvaluations = async (unsyncedEvaluations: Evaluation[]): Promise<{
    id: string,
    updatedAt: string
  }[]> => {
    if (unsyncedEvaluations.length === 0) return [];
    const result = await syncEvaluationsOnServer(unsyncedEvaluations) as { id: string, updatedAt: string }[] | null;
    return result ?? [];
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

  const loadEvaluations = async () => {
    try {
      const loadedEvaluations = await getAllEvaluations();
      await syncEvaluations(loadedEvaluations);
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
    <EvaluationsContext.Provider value={{ evaluations, loading, addEvaluations, syncEvaluations }}>
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