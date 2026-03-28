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

import { fetchUpdatedSessions, syncSessionsOnServer } from '../api/apiClient';
import { LanguageCode } from '../constants/Language';
import { SessionMode, SessionModel, SessionModelVersion } from '../constants/Session';
import { useSessionsRepository } from '../hooks/repo';
import { Session } from '../types';
import { getCurrentISO, getTodayDate } from '../utils/dateUtil';
import {
    findChangedItems,
    findLatestUpdatedAt,
    getUnsyncedItems,
    mergeLocalAndServer,
    syncInBatches,
    updateLocalItems,
} from '../utils/sync';
import { useAppInitializer } from './AppInitializerContext';
import { useAuth } from './AuthContext';

interface SessionsContextProps {
    addSession: (
        mode: SessionMode,
        sessionModel: SessionModel,
        sessionModelVersion: SessionModelVersion,
        averageScore: number,
        wordsCount: number,
        mainLang: LanguageCode,
        translationLang: LanguageCode,
        finished: boolean,
    ) => Session;
    loading: boolean;
    sessions: Session[];
    syncSessions: () => Promise<void>;
}

const SessionsContext = createContext<SessionsContextProps>({
    addSession: () => ({
        averageScore: 0,
        date: '',
        finished: false,
        id: '',
        localDay: '',
        locallyUpdatedAt: '',
        mainLang: LanguageCode.SPANISH,
        mode: SessionMode.STUDY,
        sessionModel: SessionModel.HEURISTIC,
        sessionModelVersion: SessionModelVersion.H1,
        synced: false,
        translationLang: LanguageCode.ITALIAN,
        wordsCount: 0,
    }),
    loading: true,
    sessions: [],
    syncSessions: () => Promise.resolve(),
});

export const SessionsProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { initialLoad } = useAppInitializer();
    const { getAllSessions, saveSessions } = useSessionsRepository();
    const [sessions, setSessions] = useState<Session[]>(initialLoad.sessions);
    const [loading, setLoading] = useState(true);
    const auth = useAuth();
    const syncing = useRef(false);

    const createSession = (
        mode: SessionMode,
        sessionModel: SessionModel,
        sessionModelVersion: SessionModelVersion,
        averageScore: number,
        wordsCount: number,
        mainLang: LanguageCode,
        translationLang: LanguageCode,
        finished: boolean,
    ): Session => {
        const now = getCurrentISO();
        return {
            averageScore,
            date: now,
            finished,
            id: uuid.v4(),
            localDay: getTodayDate(),
            locallyUpdatedAt: now,
            mainLang,
            mode,
            sessionModel,
            sessionModelVersion,
            synced: false,
            translationLang,
            updatedAt: now,
            wordsCount,
        };
    };

    const addSession = (
        mode: SessionMode,
        model: SessionModel,
        version: SessionModelVersion,
        averageScore: number,
        wordsCount: number,
        mainLang: LanguageCode,
        translationLang: LanguageCode,
        finished: boolean,
    ): Session => {
        const newSession = createSession(
            mode,
            model,
            version,
            averageScore,
            wordsCount,
            mainLang,
            translationLang,
            finished,
        );
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
            const serverUpdates = await syncInBatches<Session>(
                unsyncedSessions,
                syncSessionsOnServer,
            );

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
            console.log('Error syncing sessions:', error);
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
        <SessionsContext.Provider value={{ addSession, loading, sessions, syncSessions }}>
            {children}
        </SessionsContext.Provider>
    );
};

export const useSessions = (): SessionsContextProps => {
    const context = useContext(SessionsContext);
    if (!context) {
        throw new Error('useSessions must be used within a SessionsProvider');
    }
    return context;
};
