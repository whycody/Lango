import { SESSION_MODEL } from "../store/types";
import { WordSet, WordSetStrategy } from "../store/types/WordSet";

export const mlStrategy: WordSetStrategy = (size, words, _evaluations, wordsMLStates): WordSet => {
  const activeWords = words.filter(w => w.active);
  const scored = activeWords.map(w => {
    const st = wordsMLStates?.find(s => s.wordId === w.id);
    const score = st?.gradeThreeProb ?? 0;
    return { word: w, score };
  });

  const sorted = scored.sort((a, b) => b.score - a.score).map(x => x.word);
  const selected = sorted.slice(0, size);
  return { words: selected, model: SESSION_MODEL.ML };
};