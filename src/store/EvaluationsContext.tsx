import React, { createContext, FC, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useEvaluationsRepository } from "../hooks/repo/useEvaluationsRepository";
import { fetchUpdatedEvaluations, syncEvaluationsOnServer } from "../api/apiClient";
import uuid from 'react-native-uuid';
import { Evaluation } from "../types";
import {
  findChangedItems,
  findLatestUpdatedAt,
  getUnsyncedItems,
  mergeLocalAndServer,
  syncInBatches,
  updateLocalItems
} from "../utils/sync";
import { useAppInitializer } from "./AppInitializerContext";

interface EvaluationsContextProps {
  evaluations: Evaluation[] | null;
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

const EvaluationsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { initialLoad } = useAppInitializer();
  const { getAllEvaluations, saveEvaluations } = useEvaluationsRepository();
  const [evaluations, setEvaluations] = useState<Evaluation[] | null>(initialLoad.evaluations);
  const [loading, setLoading] = useState(true);
  const syncing = useRef(false);

  const createEvaluation = (wordId: string, sessionId: string, grade: 1 | 2 | 3): Evaluation => {
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

  const addEvaluations = (evaluationsData: { wordId: string, sessionId: string, grade: 1 | 2 | 3 }[]) => {
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
      if (syncing.current) return;
      syncing.current = true;
      const evaluationsList = inputEvaluations ?? (await getAllEvaluations());
      const unsyncedEvaluations = getUnsyncedItems<Evaluation>(evaluationsList);
      const serverUpdates = await syncInBatches<Evaluation>(unsyncedEvaluations, syncEvaluationsOnServer);

      if (!serverUpdates) return;

      const updatedEvaluations = updateLocalItems<Evaluation>(evaluationsList, serverUpdates);
      const serverEvaluations = await fetchNewEvaluations(updatedEvaluations);
      const mergedEvaluations = mergeLocalAndServer<Evaluation>(updatedEvaluations, serverEvaluations);
      const changedEvaluations = findChangedItems<Evaluation>(evaluationsList, mergedEvaluations);

      if (changedEvaluations.length > 0) {
        setEvaluations(mergedEvaluations);
        await saveEvaluations(changedEvaluations);
      }
    } catch (error) {
      console.log("Error syncing evaluations:", error);
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