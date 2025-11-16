import { Word } from "../core/Word";
import { WordMLState } from "../states/WordMLState";

export type WordWithDetails = {
  id: string;
} & Omit<WordMLState, 'wordId'> & Word;