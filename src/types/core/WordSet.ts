import { Word } from "./Word";
import { SESSION_MODEL } from "./User";

export type WordSet = {
  words: Word[];
  model: SESSION_MODEL;
}