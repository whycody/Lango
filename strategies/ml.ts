import { Word, SESSION_MODE, SESSION_MODEL } from "../store/types";
import { WordSetStrategy } from "../store/types/WordSet";

export const mlStrategy: WordSetStrategy = (size, mode, words, wordDetails) => {
  const sortedDetails = [...wordDetails].sort((a, b) => {
    if (mode === SESSION_MODE.RANDOM) return Math.random() - 0.5;
    if (mode === SESSION_MODE.STUDY) return a.gradeThreeProb - b.gradeThreeProb;
    if (mode === SESSION_MODE.OLDEST) return b.hoursSinceLastRepetition - a.hoursSinceLastRepetition;
    return 0;
  });

  const slicedDetails = sortedDetails.slice(0, size);
  const idToWordMap = new Map(words.map(w => [w.id, w]));
  const ids = slicedDetails.map(wd => wd.wordId);

  const result: Word[] = ids
    .map(id => idToWordMap.get(id))
    .filter((w): w is Word => w !== undefined)
    .sort(() => Math.random() - 0.5);

  return { words: result, model: SESSION_MODEL.ML };
};