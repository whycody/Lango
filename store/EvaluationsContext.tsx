import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import { useEvaluationsRepository } from "../hooks/repo/useEvaluationsRepository";
import { fetchUpdatedEvaluations, syncEvaluationsOnServer } from "../api/apiClient";
import uuid from 'react-native-uuid';
import { Evaluation } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const EvaluationsProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAllEvaluations, saveEvaluations, createTables } = useEvaluationsRepository();
  const [evaluations, setEvaluations] = useState<Evaluation[] | null>(null);
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
      const serverEvaluations = await fetchNewEvaluations(updatedLocalEvaluations);
      const mergedEvaluations = mergeLocalAndServerEvaluations(updatedLocalEvaluations, serverEvaluations);
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

  const syncUnsyncedEvaluations = async (unsyncedEvaluations: Evaluation[]): Promise<{
    id: string,
    updatedAt: string
  }[]> => {
    if (unsyncedEvaluations.length === 0) return [];
    const result = await syncEvaluationsOnServer(unsyncedEvaluations) as { id: string, updatedAt: string }[] | null;
    return result ?? [];
  };

  const findLatestUpdatedAt = (evaluations: Evaluation[]): string => {
    return new Date(
      Math.max(...evaluations.map(evaluation => new Date(evaluation.updatedAt || evaluation.locallyUpdatedAt).getTime()), 0)
    ).toISOString();
  };

  const fetchNewEvaluations = async (updatedEvaluations: Evaluation[]): Promise<Evaluation[]> => {
    const latestUpdatedAt = findLatestUpdatedAt(updatedEvaluations);
    return await fetchUpdatedEvaluations(latestUpdatedAt);
  };

  const mergeLocalAndServerEvaluations = (localEvaluations: Evaluation[], serverEvaluations: Evaluation[]): Evaluation[] => {
    const serverEvaluationsMap = new Map(serverEvaluations.map(sw => [sw.id, sw]));
    const existingIds = new Set(localEvaluations.map(w => w.id));

    const mergedEvaluations = localEvaluations.map(word => {
      if (serverEvaluationsMap.has(word.id)) {
        const serverEvaluations = serverEvaluationsMap.get(word.id)!;
        return {
          ...serverEvaluations,
          synced: true,
          locallyUpdatedAt: serverEvaluations.updatedAt,
          updatedAt: serverEvaluations.updatedAt,
        };
      }
      return word;
    });

    const newEvaluations = serverEvaluations.filter(sw => !existingIds.has(sw.id)).map(sw => ({
      ...sw,
      synced: true,
      locallyUpdatedAt: sw.updatedAt,
      updatedAt: sw.updatedAt,
    }));

    return [...mergedEvaluations, ...newEvaluations];
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

  const findChangedEvaluations = (originalEvaluations: Evaluation[], finalEvaluations: Evaluation[]): Evaluation[] => {
    const originalMap = new Map(originalEvaluations.map(evaluation => [evaluation.id, evaluation]));

    return finalEvaluations.filter(evaluation => {
      const original = originalMap.get(evaluation.id);
      if (!original) return true;
      return (
        original.synced !== evaluation.synced ||
        original.updatedAt !== evaluation.updatedAt ||
        original.locallyUpdatedAt !== evaluation.locallyUpdatedAt
      );
    });
  };

  const saveEvaluationsFromAsyncStorage = async () => {
    try {
      const storedEvaluations = await AsyncStorage.getItem('evaluations');
      if (!storedEvaluations) return;

      const parsedEvaluations: Evaluation[] = JSON.parse(storedEvaluations);
      const evaluationsToLoad = parsedEvaluations.map((evaluation) => ({
        ...evaluation,
        synced: false,
        locallyUpdatedAt: evaluation.locallyUpdatedAt ?? new Date().toISOString(),
      }));

      await saveEvaluations(evaluationsToLoad);
      await AsyncStorage.removeItem('evaluations');
      console.log('Migrated evaluations from AsyncStorage to SQLite');
    } catch (error) {
      console.error('Error migrating evaluations from AsyncStorage:', error);
    }
  };

  const loadEvaluations = async () => {
    try {
      const loadedEvaluations = await getAllEvaluations();
      setEvaluations(loadedEvaluations);
      await syncEvaluations(loadedEvaluations);
    } catch (error) {
      console.log('Error loading words from storage:', error);
    }
  }

  const loadData = async () => {
    try {
      setLoading(true);
      await createTables();
      await saveEvaluationsFromAsyncStorage();
      await loadEvaluations();
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