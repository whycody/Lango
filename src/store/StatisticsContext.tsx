import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import { useSessions } from "./SessionsContext";
import { useAuth } from "../api/auth/AuthProvider";

interface StatisticsContextProps {
  numberOfSessions: number;
  studyDaysList: string[];
}

export const StatisticsContext = createContext<StatisticsContextProps>({
  numberOfSessions: 0,
  studyDaysList: [],
});

const StatisticsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { sessions } = useSessions();
  const { user } = useAuth();
  const [daysList, setDaysList] = useState<string[]>(user.stats?.studyDays || []);
  const [serverSessionsCount, setServerSessionsCount] = useState(user.stats?.sessionCount || 0);

  const localUnsyncedSessions = sessions.filter(s => !s.synced);
  const localUnsyncedSessionsCount = localUnsyncedSessions.length;
  const numberOfSessions = serverSessionsCount + localUnsyncedSessionsCount;

  useEffect(() => {
    const serverDaysLocal = user.stats?.studyDays || [];
    const unsyncedLocalDays = localUnsyncedSessions.map(s => s.localDay);

    const combinedDaysSet = new Set([
      ...serverDaysLocal,
      ...unsyncedLocalDays,
    ]);

    const combinedDaysList = Array.from(combinedDaysSet).sort();

    setDaysList(combinedDaysList);
    setServerSessionsCount(user.stats?.sessionCount || 0);
  }, [user.stats, sessions]);

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

export const useStatistics = () => {
  const context = useContext(StatisticsContext);

  if (!context) {
    throw new Error("useStatistics must be used within a StatisticsProvider");
  }

  return context;
};

export default StatisticsProvider;