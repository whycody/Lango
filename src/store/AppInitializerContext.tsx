import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import { useEvaluationsRepository } from "../hooks/repo/useEvaluationsRepository";
import { useWordsRepository } from "../hooks/repo/useWordsRepository";
import { useSessionsRepository } from "../hooks/repo/useSessionsRepository";
import { useAuth } from "../api/auth/AuthProvider";
import { useSuggestionsRepository } from "../hooks/repo/useSuggestionsRepository";
import { runMigrations } from "../database/migrations/migrations";
import { useWordsMLStatesRepository } from "../hooks/repo/useWordsMLStatesRepository";
import { useWordsHeuristicStatesRepository } from "../hooks/repo/useWordsHeuristicStatesRepository";
import { InitialLoad } from "../types";

interface AppInitializerContextProps {
  initialLoad: InitialLoad | null;
  loading: boolean;
}

export const AppInitializerContext = createContext<AppInitializerContextProps>({
  initialLoad: null,
  loading: true,
});

export const MAIN_LANG = "mainLangCode";
export const TRANSLATION_LANG = "translationLangCode";

const AppInitializerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { createTables: createSessionsTables, getAllSessions } = useSessionsRepository();
  const { createTables: createWordsTables, getAllWords } = useWordsRepository();
  const { createTables: createEvaluationsTables, getAllEvaluations } = useEvaluationsRepository();
  const { createTables: createSuggestionsTables, getAllSuggestions } = useSuggestionsRepository();
  const {
    createTables: createWordsMLStatesTables,
    getAllWordsStates: getAllWordsMLStates
  } = useWordsMLStatesRepository();
  const {
    createTables: createWordsHeuristicStatesTables,
    getAllWordsStates: getAllWordsHeuristicStates
  } = useWordsHeuristicStatesRepository();

  const [initialLoad, setInitialLoad] = useState<InitialLoad | null>(null);
  const [loading, setLoading] = useState(true);

  const init = async () => {
      try {
        await Promise.all([
          createSessionsTables(),
          createWordsTables(),
          createEvaluationsTables(),
          createSuggestionsTables(),
          createWordsMLStatesTables(),
          createWordsHeuristicStatesTables()
        ]);

        await runMigrations(user.userId);

        const [sessions, words, evaluations, suggestions, wordsMLStates, wordsHeuristicStates] = await Promise.all([
          getAllSessions(),
          getAllWords(),
          getAllEvaluations(),
          getAllSuggestions(),
          getAllWordsMLStates(),
          getAllWordsHeuristicStates(),
        ]);

        setInitialLoad({
          sessions,
          words,
          evaluations,
          suggestions,
          wordsMLStates,
          wordsHeuristicStates
        });
      } catch
        (e) {
        console.error("AppInitializer init failed", e);
      }
    }
  ;

  useEffect(() => {
    setLoading(!initialLoad);
  }, [initialLoad]);

  useEffect(() => {
    if (!user?.userId) {
      setInitialLoad(null);
    } else {
      init();
    }
  }, [user?.userId]);

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