import { SyncMetadata } from "./SyncMetadata";

export type Evaluation = SyncMetadata & {
  id: string;
  wordId: string;
  sessionId: string;
  grade: 1 | 2 | 3;
  date: string;
};