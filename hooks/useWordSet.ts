import { useMemo } from 'react';
import { useWordDetails } from "../store/WordsDetailsContext";
import { useWords } from "../store/WordsContext";
import { SESSION_MODE, Word } from "../store/types";

export const useWordSet = (size: number, mode: SESSION_MODE): Word[] => {
  const { langWords } = useWords();
  const { wordsDetails } = useWordDetails();

  return useMemo(() => {
    const now = new Date();

    const sortedWords = [...langWords]
      .filter(word => word.active)
      .sort((a, b) => {
        if (mode === SESSION_MODE.RANDOM) return Math.random() - 0.5;
        const dateA = new Date(mode === SESSION_MODE.STUDY ? a.nextReviewDate : a.lastReviewDate).getTime();
        const dateB = new Date(mode === SESSION_MODE.STUDY ? b.nextReviewDate : b.lastReviewDate).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.repetitionCount - b.repetitionCount;
      });

    const reviewWords = sortedWords.filter(word => new Date(word.nextReviewDate) <= now);

    return reviewWords.length >= size
      ? reviewWords.slice(0, size).sort(() => Math.random() - 0.5)
      : [...reviewWords, ...sortedWords.slice(reviewWords.length, size)]
          .slice(0, size)
          .sort(() => Math.random() - 0.5);
  }, [langWords, size, mode]);
};
