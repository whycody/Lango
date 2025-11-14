import { Word } from "./Word";
import { WordMLState } from "./WordMLState";

export type WordWithDetails = {
  id: string;
} & Omit<WordMLState, 'wordId'> & Word;