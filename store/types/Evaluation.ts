import { SyncMetadata } from "./SyncMetadata";

export type Evaluation = SyncMetadata & {
  id: string;
  wordId: string;
  sessionId: string;
  grade: number;
  date: string;
};