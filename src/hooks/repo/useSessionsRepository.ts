import { createTables, getAllSessions, saveSessions } from '../../database/SessionRepository';
import { Session } from '../../types';
import { useRepositoryUserId } from './useRepositoryUserId';

export const useSessionsRepository = () => {
    const getUserId = useRepositoryUserId();

    return {
        createTables: () => createTables(getUserId()),
        getAllSessions: () => getAllSessions(getUserId()),
        saveSessions: (sessions: Session[]) => saveSessions(getUserId(), sessions),
    };
};
