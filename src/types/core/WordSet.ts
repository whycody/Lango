import { SessionWord } from "./Word";
import { SessionModel, SessionModelVersion } from "./User";

export type WordSet = {
  sessionWords: SessionWord[];
  model: SessionModel;
  version: SessionModelVersion;
};
