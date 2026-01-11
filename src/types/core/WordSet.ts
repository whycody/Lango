import { Word } from "./Word";
import { SessionModel } from "./User";

export type WordSet = {
  words: Word[];
  model: SessionModel;
}