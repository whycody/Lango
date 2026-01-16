import { SessionModel, SessionModelVersion, WordSet, WordSetStrategy } from "../../types";

export const mlStrategy: WordSetStrategy = (size, words, _evaluations, wordsMLStates): WordSet => {
  const activeWords = words.filter(w => w.active);
  const scored = activeWords.map(w => {
    const st = wordsMLStates?.find(s => s.wordId === w.id);
    const score = st?.gradeThreeProb ?? 0;
    return { word: w, score };
  });

  const sorted = scored.sort((a, b) => a.score - b.score).map(x => x.word);
  const selected = sorted.slice(0, size);
  return { words: selected, model: SessionModel.ML, version: SessionModelVersion.ML2 };
};