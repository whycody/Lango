import { SessionModel, WordSet, WordSetStrategy } from "../../types";

export const randomStrategy: WordSetStrategy = (size, words): WordSet => {
  const active = words.filter(w => w.active);
  const shuffled = [...active].sort(() => Math.random() - 0.5);
  return { words: shuffled.slice(0, size), model: SessionModel.NONE };
};