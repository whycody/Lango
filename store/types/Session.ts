export enum SESSION_MODE {
  STUDY = 'STUDY',
  RANDOM = 'RANDOM',
  OLDEST = 'OLDEST'
}

export type Session = {
  id: string;
  date: string;
  mode: SESSION_MODE;
  averageScore: number;
  wordsCount: number;
  finished: boolean;
  synced: boolean;
  updatedAt?: string;
  locallyUpdatedAt: string;
}