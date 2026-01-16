import { Word } from "./Word";
import { SessionModel, SessionModelVersion } from "./User";

export type WordSet = {
  words: Word[];
  model: SessionModel;
  version: SessionModelVersion
}