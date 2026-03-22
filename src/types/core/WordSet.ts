import { SessionModel, SessionModelVersion } from "../../constants/Session";
import { SessionWord } from "./Word";

export type WordSet = {
  sessionWords: SessionWord[];
  model: SessionModel;
  version: SessionModelVersion;
};
