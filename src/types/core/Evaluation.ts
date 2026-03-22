import { EvaluationGrade } from "../../constants/Evaluation";
import { SyncMetadata } from "../sync/SyncMetadata";

export type Evaluation = SyncMetadata & {
  id: string;
  wordId: string;
  sessionId: string;
  grade: EvaluationGrade;
  date: string;
};
