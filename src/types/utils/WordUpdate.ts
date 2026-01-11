import { EvaluationGrade } from "../core/Evaluation";

export type WordUpdate = {
  flashcardId: string;
  grade: EvaluationGrade;
};