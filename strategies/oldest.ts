import { WordSet, WordSetStrategy } from "../store/types/WordSet";
import { SESSION_MODEL } from "../store/types";

export const oldestStrategy: WordSetStrategy = (size, words): WordSet => {
  const active = words.filter(w => w.active);
  const sorted = [...active].sort((a, b) =>
    new Date(a.lastReviewDate).getTime() - new Date(b.lastReviewDate).getTime()
  );
  return { words: sorted.slice(0, size), model: SESSION_MODEL.NONE };
};