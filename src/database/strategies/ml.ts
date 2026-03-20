import {
  PICKED_SESSION_MODEL_VERSION,
  SessionModel,
  WordSet,
  WordSetStrategy,
} from "../../types";
import {
  mapSuggestionsToSessionWords,
  mapWordsToSessionWords,
} from "../../utils/sessionWordMapper";
import { shuffle } from "../../utils/shuffle";

export const mlStrategy: WordSetStrategy = (
  size,
  words,
  suggestions,
  _evaluations,
  wordsMLStates,
): WordSet => {
  const statesMap = new Map((wordsMLStates ?? []).map((s) => [s.wordId, s]));
  const activeWords = words.filter((w) => w.active);
  const scored = activeWords.map((w) => ({
    word: w,
    score: statesMap.get(w.id)?.gradeThreeProb ?? 0,
  }));
  const sorted = [...scored].sort((a, b) => a.score - b.score);
  const candidates = sorted.slice(0, size);

  const wellKnownCount = candidates.filter((s) => s.score >= 0.75).length;

  let suggestionsToAdd = Math.min(
    Math.floor(size * 0.2),
    wellKnownCount,
    suggestions.length,
  );

  let wordsToTake = size - suggestionsToAdd;

  if (candidates.length < wordsToTake) {
    const missing = wordsToTake - candidates.length;
    suggestionsToAdd = Math.min(suggestions.length, suggestionsToAdd + missing);
    wordsToTake = size - suggestionsToAdd;
  }

  const pickedWords = [
    ...mapWordsToSessionWords(
      candidates.slice(0, wordsToTake).map((w) => w.word),
    ),
    ...mapSuggestionsToSessionWords(
      shuffle(suggestions).slice(0, suggestionsToAdd),
    ),
  ];

  return {
    sessionWords: shuffle(pickedWords),
    model: SessionModel.ML,
    version: PICKED_SESSION_MODEL_VERSION,
  };
};
