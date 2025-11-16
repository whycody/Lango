import { SESSION_MODEL } from "../../types";
import { WordSet } from "../../types/core/WordSet";
import { WordSetStrategy } from "../../types/utils/WordSetStrategy";

export const heuristicStrategy: WordSetStrategy = (size, words, _wordsMLStates, _evaluations, wordsHeuristicStates): WordSet => {
  const sortedStates = wordsHeuristicStates.sort((a, b) =>
    new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());
  const pickedWordsIds = sortedStates.slice(0, size).map((state) => state.wordId);
  const selectedWords = words.filter(({ id }) => pickedWordsIds.includes(id));
  return { words: selectedWords, model: SESSION_MODEL.HEURISTIC };
};