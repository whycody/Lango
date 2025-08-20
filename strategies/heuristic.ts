import { Word, SESSION_MODE, SESSION_MODEL } from "../store/types";
import { WordSetStrategy } from "../store/types/WordSet";

export const heuristicStrategy: WordSetStrategy = (size, mode, words) => {
  const now = new Date();

  const sortedWords = [...words].filter(w => w.active).sort((a, b) => {
    if (mode === SESSION_MODE.RANDOM) return Math.random() - 0.5;
    const dateA = new Date(mode === SESSION_MODE.STUDY ? a.nextReviewDate : a.lastReviewDate).getTime();
    const dateB = new Date(mode === SESSION_MODE.STUDY ? b.nextReviewDate : b.lastReviewDate).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return a.repetitionCount - b.repetitionCount;
  });

  const reviewWords = sortedWords.filter(w => new Date(w.nextReviewDate) <= now);
  const selected: Word[] = reviewWords.length >= size
    ? reviewWords.slice(0, size).sort(() => Math.random() - 0.5)
    : [...reviewWords, ...sortedWords.slice(reviewWords.length, size)].slice(0, size).sort(() => Math.random() - 0.5);

  return { words: selected, model: SESSION_MODEL.HEURISTIC };
};