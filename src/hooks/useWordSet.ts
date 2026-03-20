import { useMemo } from "react";
import { useWords } from "../store/WordsContext";
import { useWordsMLStatesContext } from "../store/WordsMLStatesContext";
import { useAuth } from "../api/auth/AuthProvider";
import { useSessions } from "../store/SessionsContext";
import {
  Session,
  SessionMode,
  SessionModel,
  Suggestion,
  Word,
  WordSet,
  WordSetStrategy,
} from "../types";
import { strategies } from "../database/strategies";
import { useWordsHeuristicStates } from "../store/WordsHeuristicStatesContext";
import { useEvaluations } from "../store/EvaluationsContext";
import { shuffle } from "../utils/shuffle";
import { useSuggestions } from "../store/SuggestionsContext";
import {
  mapSuggestionsToSessionWords,
  mapWordsToSessionWords,
} from "../utils/sessionWordMapper";
import { enhanceWords } from "../utils/enhanceWords";

const getLastSessionModel = (sessions?: Session[]): SessionModel | undefined =>
  sessions
    ?.filter((s: Session) => s.mode === SessionMode.STUDY)
    .sort(
      (a: Session, b: Session) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0]?.sessionModel;

const resolveStrategy = (
  mode: SessionMode,
  model: SessionModel,
): WordSetStrategy => {
  if (mode === SessionMode.OLDEST) return strategies.OLDEST;
  if (mode === SessionMode.RANDOM) return strategies.RANDOM;

  switch (model) {
    case SessionModel.HEURISTIC:
      return strategies.HEURISTIC;
    case SessionModel.ML:
      return strategies.ML;
    case SessionModel.HYBRID:
    default:
      return strategies.HYBRID;
  }
};

const buildFallbackSet = (
  size: number,
  words: Word[],
  suggestions: Suggestion[],
) =>
  shuffle([
    ...mapWordsToSessionWords(words),
    ...mapSuggestionsToSessionWords(
      shuffle(suggestions).slice(0, size - words.length),
    ),
  ]);

export const useWordSet = (size: number, mode: SessionMode): WordSet => {
  const { langWords } = useWords();
  const { langSuggestions } = useSuggestions();
  const { evaluations } = useEvaluations();
  const { langWordsMLStates } = useWordsMLStatesContext();
  const { langWordsHeuristicStates } = useWordsHeuristicStates();
  const { sessions } = useSessions();
  const { user } = useAuth();

  return useMemo(() => {
    const lastSessionModel = getLastSessionModel(sessions);
    const currentModel = user.sessionModel || SessionModel.HYBRID;

    const strategyFactory = resolveStrategy(mode, currentModel);

    const strategy = strategyFactory(
      size,
      langWords,
      langSuggestions,
      evaluations,
      langWordsMLStates,
      langWordsHeuristicStates,
      lastSessionModel,
    );

    if (langWords.length < size) {
      const fallbackSet = buildFallbackSet(size, langWords, langSuggestions);
      const enhanced = enhanceWords(fallbackSet, langWordsMLStates);
      return {
        sessionWords: enhanced,
        model: strategy.model,
        version: strategy.version,
      };
    }

    const enhanced = enhanceWords(
      shuffle(strategy.sessionWords),
      langWordsMLStates,
    );

    return {
      sessionWords: enhanced,
      model: strategy.model,
      version: strategy.version,
    };
  }, [
    user.sessionModel,
    langWords,
    langSuggestions,
    evaluations.length,
    langWordsMLStates,
    langWordsHeuristicStates,
    sessions,
    size,
    mode,
  ]);
};
