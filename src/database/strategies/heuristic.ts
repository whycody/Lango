import { SESSION_MODEL, WordSet, WordSetStrategy } from "../../types";

export const heuristicStrategy: WordSetStrategy = (size, words, _wordsMLStates, _evaluations, wordsHeuristicStates): WordSet => {
  const sortedStates = wordsHeuristicStates.sort((a, b) =>
    new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());
  const pickedWordsIds = sortedStates.slice(0, size).map((state) => state.wordId);
  const selectedWords = words.filter(({ id }) => pickedWordsIds.includes(id));
  return { words: selectedWords, model: SESSION_MODEL.HEURISTIC };
};