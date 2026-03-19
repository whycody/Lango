import { SessionModel, SessionModelVersion, Word, WordSet, WordSetStrategy } from "../../types";
import { mapSuggestionsToSessionWords, mapWordsToSessionWords } from "../../utils/sessionWordMapper";
import { shuffle } from "../../utils/shuffle";

export const heuristicStrategy: WordSetStrategy = (size, words, suggestions, _wordsMLStates, _evaluations, wordsHeuristicStates): WordSet => {
  const now = Date.now();

  const sortedStates = [...wordsHeuristicStates].sort((a, b) =>
    new Date(a.nextReviewDate).getTime() -
    new Date(b.nextReviewDate).getTime()
  );

  const pickedStates = sortedStates.slice(0, size);
  const wordsById = new Map(words.map(w => [w.id, w]));

  const selectedWords = pickedStates
    .map(s => wordsById.get(s.wordId))
    .filter(Boolean) as Word[];

  const wellKnownCount = pickedStates.filter(s => s.studyCount > 2 && new Date(s.nextReviewDate).getTime() > now).length;

  let suggestionsToAdd = Math.min(
    Math.floor(size * 0.2),
    wellKnownCount,
    suggestions.length
  );

  let wordsToTake = size - suggestionsToAdd;

  if (selectedWords.length < wordsToTake) {
    const missing = wordsToTake - selectedWords.length;
    suggestionsToAdd = Math.min(suggestions.length, suggestionsToAdd + missing);
    wordsToTake = size - suggestionsToAdd;
  }

  const pickedWords = [
    ...mapWordsToSessionWords(selectedWords.slice(0, wordsToTake)),
    ...mapSuggestionsToSessionWords(shuffle(suggestions).slice(0, suggestionsToAdd)),
  ];

  return {
    sessionWords: shuffle(pickedWords),
    model: SessionModel.HEURISTIC,
    version: SessionModelVersion.H1,
  };
};