import { createTables, getAllSessions, saveSessions } from '../../database/SessionRepository';
import { useAuth } from '../../store';
import { Session } from '../../types';

export const useSessionsRepository = () => {
    const { user } = useAuth();

    const getUserId = () => {
        if (!user?.userId) throw new Error('User not logged in');
        return user.userId;
    };

    return {
        createTables: () => createTables(getUserId()),
        getAllSessions: () => getAllSessions(getUserId()),
        saveSessions: (sessions: Session[]) => saveSessions(getUserId(), sessions),
    };
};
