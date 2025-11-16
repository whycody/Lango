import { WordSet } from "../../types/core/WordSet";
import { SESSION_MODEL } from "../../types";
import { WordSetStrategy } from "../../types/utils/WordSetStrategy";

export const oldestStrategy: WordSetStrategy = (size, words, evaluations): WordSet => {
  const active = words.filter(w => w.active);

  const lastDates = new Map<string, number>();
  for (const e of evaluations) {
    const t = new Date(e.date).getTime();
    const prev = lastDates.get(e.wordId) ?? 0;
    if (t > prev) lastDates.set(e.wordId, t);
  }

  const sorted = [...active].sort((a, b) => {
    const aDate = lastDates.get(a.id) ?? 0;
    const bDate = lastDates.get(b.id) ?? 0;
    return aDate - bDate;
  });

  return { words: sorted.slice(0, size), model: SESSION_MODEL.NONE };
};