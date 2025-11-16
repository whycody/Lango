import { WordSet } from "../../types/core/WordSet";
import { SESSION_MODEL } from "../../types";
import { WordSetStrategy } from "../../types/utils/WordSetStrategy";

export const randomStrategy: WordSetStrategy = (size, words): WordSet => {
  const active = words.filter(w => w.active);
  const shuffled = [...active].sort(() => Math.random() - 0.5);
  return { words: shuffled.slice(0, size), model: SESSION_MODEL.NONE };
};