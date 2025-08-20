import { SESSION_MODE } from "./Session";
import { Word } from "./Word";
import { WordDetails } from "./WordDetails";
import { SESSION_MODEL } from "./User";

export type WordSetStrategy = (
  size: number,
  mode: SESSION_MODE,
  words: Word[],
  wordDetails: WordDetails[],
  lastSessionModel?: SESSION_MODEL
) => WordSet;

export type WordSet = {
  words: Word[];
  model: SESSION_MODEL;
}