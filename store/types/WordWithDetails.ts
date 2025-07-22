import { Word } from "./Word";
import { WordDetails } from "./WordDetails";

export type WordWithDetails = {
  id: string;
} & Omit<WordDetails, 'wordId'> & Word;