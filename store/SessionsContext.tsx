import React, { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react';
import { useSessionsRepository } from "../hooks/repo/useSessionsRepository";
import uuid from 'react-native-uuid';
import { fetchUpdatedSessions, syncSessionsOnServer } from "../api/apiClient";
import { Session, SESSION_MODE, SESSION_MODEL } from './types';
import { useAuth } from "../api/auth/AuthProvider";
import {
  findChangedItems,
  findLatestUpdatedAt,
  getUnsyncedItems,
  mergeLocalAndServer,
  syncInBatches,
  updateLocalItems
} from "../utils/sync";

interface SessionsContextProps {
  sessions: Session[];
  loading: boolean;
  addSession: (mode: SESSION_MODE, model: SESSION_MODEL, averageScore: number, wordsCount: number, finished: boolean) => Session;
  syncSessions: () => Promise<void>;
}

const SessionsContext = createContext<SessionsContextProps>({
  sessions: [],
  loading: true,
  addSession: () => ({
    id: '',
    date: '',
    mode: SESSION_MODE.STUDY,
    sessionModel: SESSION_MODEL.HEURISTIC,
    averageScore: 0,
    wordsCount: 0,
    finished: false,
    synced: false,
    locallyUpdatedAt: ''
  }),
  syncSessions: () => Promise.resolve(),
});

export const SessionsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { getAllSessions, saveSessions, createTables } = useSessionsRepository();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  const createSession = (mode: SESSION_MODE, model: SESSION_MODEL, averageScore: number, wordsCount: number, finished: boolean): Session => {
    const now = new Date().toISOString();
    return {
      id: uuid.v4(),
      date: now,
      mode: mode,
      sessionModel: model,
      averageScore,
      wordsCount,
      finished,
      synced: false,
      updatedAt: now,
      locallyUpdatedAt: now,
    };
  };

  const addSession = (mode: SESSION_MODE, model: SESSION_MODEL, averageScore: number, wordsCount: number, finished: boolean) => {
    const newSession = createSession(mode, model, averageScore, wordsCount, finished);
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    saveSessions([newSession]);
    syncSessions(updatedSessions).then(auth.getSession);
    return newSession;
  };

  const syncSessions = async (inputSessions?: Session[]) => {
    try {
      const sessionsList = inputSessions ?? (await getAllSessions());
      const unsyncedSessions = getUnsyncedItems<Session>(sessionsList);
      const serverUpdates = await syncInBatches<Session>(unsyncedSessions, syncSessionsOnServer);

      if (!serverUpdates) return;

      const updatedSessions = updateLocalItems<Session>(sessionsList, serverUpdates);
      const serverSessions = await fetchNewSessions(updatedSessions);
      const mergedSessions = mergeLocalAndServer<Session>(updatedSessions, serverSessions);

      const changedSessions = findChangedItems<Session>(sessionsList, mergedSessions);

      if (changedSessions.length > 0) {
        setSessions(mergedSessions);
        await saveSessions(changedSessions);
      }
    } catch (error) {
      console.log("Error syncing sessions:", error);
    }
  };

  const fetchNewSessions = async (updatedSessions: Session[]): Promise<Session[]> => {
    const latestUpdatedAt = findLatestUpdatedAt<Session>(updatedSessions);
    return await fetchUpdatedSessions(latestUpdatedAt);
  };

  const loadSessions = async () => {
    try {
      const loadedSessions = await getAllSessions();
      await syncSessions(loadedSessions);
      setSessions(loadedSessions);
    } catch (error) {
      console.log('Error loading sessions from storage:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await createTables();
      await loadSessions();
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
    <SessionsContext.Provider value={{ sessions, loading, addSession, syncSessions }}>
      {children}
    </SessionsContext.Provider>
  );
};

export const useSessions = (): SessionsContextProps => {
  const context = useContext(SessionsContext);
  if (!context) {
    throw new Error("useSessions must be used within a SessionsProvider");
  }
  return context;
};

export default SessionsProvider;