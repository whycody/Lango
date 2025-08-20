import { SESSION_MODEL } from "./User";

export enum SESSION_MODE {
  STUDY = 'STUDY',
  RANDOM = 'RANDOM',
  OLDEST = 'OLDEST'
}

export type Session = {
  id: string;
  date: string;
  mode: SESSION_MODE;
  sessionModel: SESSION_MODEL;
  averageScore: number;
  wordsCount: number;
  finished: boolean;
  synced: boolean;
  updatedAt?: string;
  locallyUpdatedAt: string;
}