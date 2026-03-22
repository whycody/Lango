import { SyncMetadata } from "../sync/SyncMetadata";
import { LanguageCode } from "../../constants/Language";
import {
  SessionMode,
  SessionModel,
  SessionModelVersion,
} from "../../constants/Session";

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
};
