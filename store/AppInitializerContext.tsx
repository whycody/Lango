import { Evaluation, Session, Suggestion, Word } from "./types";
import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import { useEvaluationsRepository } from "../hooks/repo/useEvaluationsRepository";
import { useWordsRepository } from "../hooks/repo/useWordsRepository";
import { useSessionsRepository } from "../hooks/repo/useSessionsRepository";
import { useAuth } from "../api/auth/AuthProvider";
import { useSuggestionsRepository } from "../hooks/repo/useSuggestionsRepository";
import { runMigrations } from "../database/utils/migrations";

type InitialLoad = {
  sessions: Session[];
  words: Word[];
  evaluations: Evaluation[];
  suggestions: Suggestion[];
};

interface AppInitializerContextProps {
  initialLoad: InitialLoad | null;
  loading: boolean;
}

export const AppInitializerContext = createContext<AppInitializerContextProps>({
  initialLoad: null,
  loading: true,
});

const AppInitializerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { createTables: createSessionsTables, getAllSessions } = useSessionsRepository();
  const { createTables: createWordsTables, getAllWords } = useWordsRepository();
  const { createTables: createEvaluationsTables, getAllEvaluations } = useEvaluationsRepository();
  const { createTables: createSuggestionsTables, getAllSuggestions } = useSuggestionsRepository();

  const [initialLoad, setInitialLoad] = useState<InitialLoad>({
    sessions: [],
    words: [],
    evaluations: [],
    suggestions: []
  });
  const [loading, setLoading] = useState(true);

  const init = async () => {
    if (!user?.userId) return;
    try {
      await Promise.all([
        createSessionsTables(),
        createWordsTables(),
        createEvaluationsTables(),
        createSuggestionsTables()
      ]);

      await runMigrations(user.userId);

      const [sessions, words, evaluations, suggestions] = await Promise.all([
        getAllSessions(),
        getAllWords(),
        getAllEvaluations(),
        getAllSuggestions(),
      ]);

      setInitialLoad({ sessions, words, evaluations, suggestions });
    } catch (e) {
      console.error("AppInitializer init failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <AppInitializerContext.Provider value={{ initialLoad, loading }}>
      {children}
    </AppInitializerContext.Provider>
  );
};

export const useAppInitializer = () => {
  const context = useContext(AppInitializerContext);
  if (!context) {
    throw new Error("useAppInitializer must be used within AppInitializerProvider");
  }
  return context;
};

export default AppInitializerProvider;