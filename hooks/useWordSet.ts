import { useMemo } from "react";
import { useWords } from "../store/WordsContext";
import { useWordsMLStatesContext } from "../store/WordsMLStatesContext";
import { useAuth } from "../api/auth/AuthProvider";
import { useSessions } from "../store/SessionsContext";
import { SESSION_MODE, SESSION_MODEL } from "../store/types";
import { strategies } from "../strategies";
import { WordSet } from "../store/types/WordSet";

export const useWordSet = (size: number, mode: SESSION_MODE): WordSet => {
  const { langWords } = useWords();
  const { langWordsMLStates } = useWordsMLStatesContext();
  const { sessions } = useSessions();
  const { user } = useAuth();

  return useMemo(() => {
    if (!langWords || !langWordsMLStates) return { words: [], model: SESSION_MODEL.HEURISTIC };

    const lastSession = sessions
      ?.filter(s => s.mode === SESSION_MODE.STUDY)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const lastSessionModel = lastSession?.sessionModel;

    const currentModel = user.sessionModel || SESSION_MODEL.HYBRID;

    const strategy = (() => {
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

    if (currentModel === SESSION_MODEL.HYBRID) {
      return strategy(size, mode, langWords, langWordsMLStates, lastSessionModel);
    }

    return strategy(size, mode, langWords, langWordsMLStates);
  }, [user.sessionModel, langWords, langWordsMLStates, sessions, size, mode]);
};