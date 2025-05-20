import { createContext, FC, useState, useEffect } from "react";
import { useSessions } from "./SessionsContext";
import { useAuth } from "../hooks/useAuth";

interface StatisticsContextProps {
  numberOfSessions: number;
  studyDaysList: string[];
}

export const StatisticsContext = createContext<StatisticsContextProps>({
  numberOfSessions: 0,
  studyDaysList: [],
});

export const StatisticsProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serverSessionsCount, setServerSessionsCount] = useState(0);
  const [daysList, setDaysList] = useState<string[]>([]);
  const sessions = useSessions();
  const auth = useAuth();

  const localUnsyncedSessions = sessions.sessions.filter(s => !s.synced);
  const localUnsyncedSessionsCount = localUnsyncedSessions.length;
  const numberOfSessions = serverSessionsCount + localUnsyncedSessionsCount;

  useEffect(() => {
    const serverDaysList: string[] = auth.user.stats?.studyDays || [];
    const unsyncedDaysSet = new Set(localUnsyncedSessions.map(s => s.date.split('T')[0]));

    const combinedDaysSet = new Set([
      ...serverDaysList,
      ...unsyncedDaysSet,
    ]);

    const combinedDaysList = Array.from(combinedDaysSet).sort();

    setDaysList(combinedDaysList);
    setServerSessionsCount(auth.user.stats?.sessionCount || 0);
  }, [auth.user.stats, sessions.sessions]);

  return (
    <StatisticsContext.Provider
      value={{
        numberOfSessions,
        studyDaysList: daysList,
      }}
    >
      {children}
    </StatisticsContext.Provider>
  );
};