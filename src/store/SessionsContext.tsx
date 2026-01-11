import React, { createContext, FC, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useSessionsRepository } from "../hooks/repo/useSessionsRepository";
import uuid from 'react-native-uuid';
import { fetchUpdatedSessions, syncSessionsOnServer } from "../api/apiClient";
import { LanguageCode, Session, SessionMode, SessionModel } from '../types';
import { useAuth } from "../api/auth/AuthProvider";
import {
  findChangedItems,
  findLatestUpdatedAt,
  getUnsyncedItems,
  mergeLocalAndServer,
  syncInBatches,
  updateLocalItems
} from "../utils/sync";
import { useAppInitializer } from "./AppInitializerContext";
import { getTodayDate } from "../utils/dateUtil";

interface SessionsContextProps {
  sessions: Session[];
  loading: boolean;
  addSession: (mode: SessionMode, model: SessionModel, averageScore: number, wordsCount: number,
               mainLang: LanguageCode, translationLang: LanguageCode, finished: boolean) => Session;
  syncSessions: () => Promise<void>;
}

const SessionsContext = createContext<SessionsContextProps>({
  sessions: [],
  loading: true,
  addSession: () => ({
    id: '',
    date: '',
    localDay: '',
    mode: SessionMode.STUDY,
    sessionModel: SessionModel.HEURISTIC,
    averageScore: 0,
    wordsCount: 0,
    mainLang: LanguageCode.SPANISH,
    translationLang: LanguageCode.ITALIAN,
    finished: false,
    synced: false,
    locallyUpdatedAt: ''
  }),
  syncSessions: () => Promise.resolve(),
});

export const SessionsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { initialLoad } = useAppInitializer();
  const { getAllSessions, saveSessions } = useSessionsRepository();
  const [sessions, setSessions] = useState<Session[]>(initialLoad.sessions);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const syncing = useRef(false);

  const createSession = (mode: SessionMode, model: SessionModel, averageScore: number, wordsCount: number,
                         mainLang: LanguageCode, translationLang: LanguageCode, finished: boolean): Session => {
    const now = new Date().toISOString();
    return {
      id: uuid.v4(),
      date: now,
      localDay: getTodayDate(),
      mode,
      mainLang,
      translationLang,
      sessionModel: model,
      averageScore,
      wordsCount,
      finished,
      synced: false,
      updatedAt: now,
      locallyUpdatedAt: now,
    };
  };

  const addSession = (mode: SessionMode, model: SessionModel, averageScore: number, wordsCount: number,
                      mainLang: LanguageCode, translationLang: LanguageCode, finished: boolean) => {
    const newSession = createSession(mode, model, averageScore, wordsCount, mainLang, translationLang, finished);
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    saveSessions([newSession]);
    syncSessions(updatedSessions);
    return newSession;
  };

  const syncSessions = async (inputSessions?: Session[]) => {
    try {
      if (syncing.current) return;
      syncing.current = true;
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
        await auth.getSession();
      }
    } catch (error) {
      console.log("Error syncing sessions:", error);
    } finally {
      syncing.current = false;
    }
  };

  const fetchNewSessions = async (updatedSessions: Session[]): Promise<Session[]> => {
    const latestUpdatedAt = findLatestUpdatedAt<Session>(updatedSessions);
    return await fetchUpdatedSessions(latestUpdatedAt);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await syncSessions();
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