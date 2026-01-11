import { SyncMetadata } from "../sync/SyncMetadata";

export enum EvaluationGrade {
  BAD = 1,
  MEDIUM = 2,
  GOOD = 3,
}

export type Evaluation = SyncMetadata & {
  id: string;
  wordId: string;
  sessionId: string;
  grade: EvaluationGrade;
  date: string;
};