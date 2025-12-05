import { SESSION_MODEL } from "./User";
import { SyncMetadata } from "../sync/SyncMetadata";
import { LanguageCode } from "../../constants/LanguageCode";

export enum SESSION_MODE {
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
  mode: SESSION_MODE;
  sessionModel: SESSION_MODEL;
  averageScore: number;
  wordsCount: number;
  finished: boolean;
}