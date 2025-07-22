import { createTables, getAllSessions, saveSessions } from "../database/SessionRepository";
import { useAuth } from "./useAuth";
import { Session } from "../store/types";

export const useSessionsRepository = () => {
  const userId = useAuth().user.userId;

  if (!userId) throw new Error("User not logged in");

  return {
    createTables: () => createTables(userId),
    saveSessions: (sessions: Session[]) => saveSessions(userId, sessions),
    getAllSessions: () => getAllSessions(userId),
  };
};