import { createTables, getAllSessions, saveSessions } from "../../database/SessionRepository";
import { Session } from "../../store/types";
import { useAuth } from "../../api/auth/AuthProvider";

export const useSessionsRepository = () => {
  const { user } = useAuth();

  const getUserId = () => {
    if (!user?.userId) throw new Error("User not logged in");
    return user.userId;
  };

  return {
    createTables: () => createTables(getUserId()),
    saveSessions: (sessions: Session[]) => saveSessions(getUserId(), sessions),
    getAllSessions: () => getAllSessions(getUserId()),
  };
};