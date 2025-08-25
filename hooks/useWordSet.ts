import { useMemo } from "react";
import { useWords } from "../store/WordsContext";
import { useWordsMLStatesContext } from "../store/WordsMLStatesContext";
import { useAuth } from "../api/auth/AuthProvider";
import { useSessions } from "../store/SessionsContext";
import { SESSION_MODE, SESSION_MODEL } from "../store/types";
import { strategies } from "../strategies";
import { WordSet, WordSetStrategy } from "../store/types/WordSet";
import { useWordsHeuristicStates } from "../store/WordsHeuristicStatesContext";

export const useWordSet = (size: number, mode: SESSION_MODE): WordSet => {
  const { langWords } = useWords();
  const { langWordsMLStates } = useWordsMLStatesContext();
  const { langWordsHeuristicStates } = useWordsHeuristicStates();
  const { sessions } = useSessions();
  const { user } = useAuth();

  return useMemo(() => {
    if (!langWords || !langWordsMLStates || !langWordsHeuristicStates) {
      return { words: [], model: SESSION_MODEL.NONE };
    }

    const lastSession = sessions
      ?.filter(s => s.mode === SESSION_MODE.STUDY)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const lastSessionModel = lastSession?.sessionModel;

    const currentModel = user.sessionModel || SESSION_MODEL.HYBRID;

    const strategy: WordSetStrategy = (() => {
      if (mode == SESSION_MODE.OLDEST)
        return strategies.OLDEST;
      else if (mode == SESSION_MODE.RANDOM)
        return strategies.RANDOM;
      switch (currentModel) {
        case SESSION_MODEL.HEURISTIC:
          return strategies.HEURISTIC;
        case SESSION_MODEL.ML:
          return strategies.ML;
        case SESSION_MODEL.HYBRID:
        default:
          return strategies.HYBRID;
      }
    })();

    return strategy(size, langWords, langWordsMLStates, langWordsHeuristicStates, lastSessionModel);
  }, [user.sessionModel, langWords.length, langWordsMLStates, langWordsHeuristicStates, sessions, size, mode]);
};