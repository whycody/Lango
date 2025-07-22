export type Evaluation = {
  id: string;
  wordId: string;
  sessionId: string;
  grade: number;
  date: string;
  synced: boolean;
  updatedAt?: string;
  locallyUpdatedAt: string;
}