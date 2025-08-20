import { useMemo } from 'react';
import { useWords } from "../store/WordsContext";
import { SESSION_MODE, Word } from "../store/types";
import { useWordDetails } from "../store/WordsDetailsContext";

export const useWordSet = (size: number, mode: SESSION_MODE): Word[] => {
  const { langWords } = useWords();
  const { langWordsDetails } = useWordDetails();

  return useMemo(() => {
    if (!langWords || !langWordsDetails) return [];

    const sortedDetails = [...langWordsDetails].sort((a, b) => {
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

    console.log('Sorted details: ', sortedDetails.length)

    const sliced = sortedDetails.slice(0, size)

    console.log('Sliced: ', sliced.length)

    const ids = sliced.map(wd => wd.wordId);

    const idToWordMap = new Map(langWords.map(w => [w.id, w]));

    const result: Word[] = ids
      .map(id => idToWordMap.get(id))
      .filter((w): w is Word => w !== undefined);

    console.log("📋 Wybrane słowa:");
    sliced.forEach(detail => {
      const word = idToWordMap.get(detail.wordId);
      if (word) {
        console.log(`📝 ${word.text} — gradeThreeProb: ${detail.gradeThreeProb.toFixed(2)}`);
      }
    });
    console.log("===================")

    return result.sort(() => Math.random() - 0.5);
  }, [langWords, langWordsDetails, size, mode]);
};
