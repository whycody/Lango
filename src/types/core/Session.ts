import { SessionModel, SessionModelVersion } from "./User";
import { SyncMetadata } from "../sync/SyncMetadata";
import { LanguageCode } from "../../constants/LanguageCode";

export enum SessionMode {
  STUDY = 'STUDY',
  RANDOM = 'RANDOM',
  OLDEST = 'OLDEST',
  UNKNOWN = 'UNKNOWN',
}

export type Session = SyncMetadata & {
  id: string;
  date: string;
  localDay: string;
  mainLang: LanguageCode;
  translationLang: LanguageCode;
  mode: SessionMode;
  sessionModel: SessionModel;
  sessionModelVersion: SessionModelVersion;
  averageScore: number;
  wordsCount: number;
  finished: boolean;
}