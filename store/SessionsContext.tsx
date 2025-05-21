import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import { useSessionsRepository } from "../hooks/useSessionsRepository";
import uuid from 'react-native-uuid';
import { fetchUpdatedSessions, syncSessionsOnServer } from "../hooks/useApi";
import { SESSION_MODE } from "./UserPreferencesContext";
import { useAuth } from "../hooks/useAuth";

export interface Session {
  id: string;
  date: string;
  mode: SESSION_MODE;
  averageScore: number;
  wordsCount: number;
  synced: boolean;
  updatedAt?: string;
  locallyUpdatedAt: string;
}

interface SessionsContextProps {
  sessions: Session[];
  loading: boolean;
  addSession: (mode: SESSION_MODE, averageScore: number, wordsCount: number) => Session;
  getSession: (id: string) => Session | undefined;
  syncSessions: () => Promise<void>;
}

export const SessionsContext = createContext<SessionsContextProps>({
  sessions: [],
  loading: true,
  addSession: () => ({
    id: '',
    date: '',
    mode: SESSION_MODE.STUDY,
    averageScore: 0,
    wordsCount: 0,
    synced: false,
    locallyUpdatedAt: ''
  }),
  getSession: () => undefined,
  syncSessions: () => Promise.resolve(),
});

export const SessionsProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAllSessions, saveSessions, createTables } = useSessionsRepository();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  const createSession = (mode: SESSION_MODE, averageScore: number, wordsCount: number): Session => {
    const now = new Date().toISOString();
    return {
      id: uuid.v4(),
      date: now,
      mode: mode,
      averageScore,
      wordsCount,
      synced: false,
      updatedAt: now,
      locallyUpdatedAt: now,
    };
  };

  const addSession = (mode: SESSION_MODE, averageScore: number, wordsCount: number) => {
    const newSession = createSession(mode, averageScore, wordsCount);
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    saveSessions([newSession]);
    syncSessions(updatedSessions).then(auth.getSession);
    return newSession;
  };

  const getSession = (id: string): Session | undefined => {
    return sessions.find(session => session.id === id);
  };

  const syncSessions = async (inputSessions?: Session[]) => {
    try {
      const sessionsList = inputSessions ?? (await getAllSessions());
      const unsyncedSessions = getUnsyncedSessions(sessionsList);
      const serverUpdates = await syncUnsyncedSessions(unsyncedSessions);

      if (!serverUpdates) return;

      const updatedSessions = updateLocalSessions(sessionsList, serverUpdates);
      const serverSessions = await fetchNewSessions(updatedSessions);
      const mergedSessions = mergeLocalAndServerSessions(updatedSessions, serverSessions);

      const changedSessions = findChangedSessions(sessionsList, mergedSessions);

      if (changedSessions.length > 0) {
        setSessions(mergedSessions);
        await saveSessions(changedSessions);
      }
    } catch (error) {
      console.log("Error syncing sessions:", error);
    }
  };

  const getUnsyncedSessions = (sessions: Session[]): Session[] => {
    return sessions.filter(session => !session.synced);
  };

  const syncUnsyncedSessions = async (unsyncedSessions: Session[]): Promise<{ id: string, updatedAt: string }[]> => {
    if (unsyncedSessions.length === 0) return [];
    const result = await syncSessionsOnServer(unsyncedSessions) as { id: string, updatedAt: string }[] | null;
    return result ?? [];
  };

  const updateLocalSessions = (sessions: Session[], serverUpdates: { id: string, updatedAt: string }[]): Session[] => {
    const updatesMap = new Map(serverUpdates.map(update => [update.id, update.updatedAt]));
    return sessions.map(session => {
      if (updatesMap.has(session.id)) {
        const serverUpdatedAt = updatesMap.get(session.id) as string;
        return {
          ...session,
          synced: true,
          updatedAt: serverUpdatedAt,
        };
      }
      return session;
    });
  };

  const findLatestUpdatedAt = (sessions: Session[]): string => {
    return new Date(
      Math.max(...sessions.map(session => new Date(session.updatedAt || session.date).getTime()), 0)
    ).toISOString();
  };

  const fetchNewSessions = async (updatedSessions: Session[]): Promise<Session[]> => {
    const latestUpdatedAt = findLatestUpdatedAt(updatedSessions);
    return await fetchUpdatedSessions(latestUpdatedAt);
  };

  const mergeLocalAndServerSessions = (localSessions: Session[], serverSessions: Session[]): Session[] => {
    const serverSessionsMap = new Map(serverSessions.map(ss => [ss.id, ss]));
    const existingIds = new Set(localSessions.map(s => s.id));

    const mergedSessions = localSessions.map(session => {
      if (serverSessionsMap.has(session.id)) {
        const serverSession = serverSessionsMap.get(session.id)!;
        return {
          ...serverSession,
          synced: true,
          updatedAt: serverSession.updatedAt,
        };
      }
      return session;
    });

    const newSessions = serverSessions.filter(ss => !existingIds.has(ss.id)).map(ss => ({
      ...ss,
      synced: true,
      updatedAt: ss.updatedAt,
    }));

    return [...mergedSessions, ...newSessions];
  };

  const findChangedSessions = (originalSessions: Session[], finalSessions: Session[]): Session[] => {
    const originalMap = new Map(originalSessions.map(session => [session.id, session]));

    return finalSessions.filter(session => {
      const original = originalMap.get(session.id);
      if (!original) return true;
      return (
        original.synced !== session.synced ||
        original.updatedAt !== session.updatedAt
      );
    });
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
    <SessionsContext.Provider value={{ sessions, loading, addSession, getSession, syncSessions }}>
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