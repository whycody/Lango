import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import { useSessionsRepository } from "../hooks/useSessionsRepository";
import uuid from 'react-native-uuid';
import { fetchUpdatedSessions, syncSessionsOnServer } from "../hooks/useApi";
import { SESSION_MODE } from "./UserPreferencesContext";

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
    syncSessions(updatedSessions);
    return newSession;
  };

  const getSession = (id: string): Session | undefined => {
    return sessions.find(session => session.id === id);
  };

  const syncSessions = async (inputSessions?: Session[]) => {
    try {
      const sessionsList = inputSessions ?? (await getAllSessions());
      const unsyncedSessions = sessionsList.filter(session => !session.synced);

      const res = await syncSessionsOnServer(unsyncedSessions);
      if (!res) return;

      const updatesMap = new Map(res.map((u: { id: string, updatedAt: string }) => [u.id, u.updatedAt]));

      const updatedSessions = sessionsList.map(session => {
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

      const latestUpdatedAt = new Date(
        Math.max(...updatedSessions.map(session => new Date(session.updatedAt || session.date).getTime()), 0)
      ).toISOString();

      const serverSessions = await fetchUpdatedSessions(latestUpdatedAt);
      const serverSessionsMap = new Map(serverSessions.map(ss => [ss.id, ss]));
      const existingIds = new Set(updatedSessions.map(s => s.id));

      const mergedSessions = updatedSessions.map(session => {
        if (serverSessionsMap.has(session.id)) {
          const serverSession = serverSessionsMap.get(session.id) as Session;
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

      const finalSessions = [...mergedSessions, ...newSessions];

      const changedSessions = finalSessions.filter((session, index) => {
        const originalSession = sessionsList[index];
        return (
          originalSession.synced !== session.synced ||
          originalSession.updatedAt !== session.updatedAt
        );
      });

      if (changedSessions.length > 0) {
        setSessions(finalSessions);
        await saveSessions(changedSessions);
      }
    } catch (error) {
      console.log("Error syncing sessions:", error);
    }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      await createTables();
      const loadedSessions = await getAllSessions();
      setSessions(loadedSessions);
      setLoading(false);
    } catch (error) {
      console.log('Error loading sessions from storage:', error);
    }
  };

  useEffect(() => {
    loadSessions();
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