import { useMemo } from 'react';
import { useWords } from "../store/WordsContext";
import { SESSION_MODE, Word } from "../store/types";
import { useWordDetails } from "../store/WordsDetailsContext";

export const useWordSet = (size: number, mode: SESSION_MODE): Word[] => {
  const { words } = useWords();
  const { wordsDetails } = useWordDetails();

  return useMemo(() => {
    if (!words || !wordsDetails) return [];

    const sortedDetails = [...wordsDetails].sort((a, b) => {
      if (mode === SESSION_MODE.RANDOM) {
        return Math.random() - 0.5;
      }
      if (mode === SESSION_MODE.STUDY) {
        return a.gradeThreeProb - b.gradeThreeProb;
      }
      if (mode === SESSION_MODE.OLDEST) {
        return b.hoursSinceLastRepetition - a.hoursSinceLastRepetition;
      }
      return 0;
    });

    const sliced = sortedDetails.slice(0, size)

    const ids = sliced.map(wd => wd.wordId);

    const idToWordMap = new Map(words.map(w => [w.id, w]));

    const result: Word[] = ids
      .map(id => idToWordMap.get(id))
      .filter((w): w is Word => w !== undefined);

    return result.sort(() => Math.random() - 0.5);
  }, [words, wordsDetails, size, mode]);
};
