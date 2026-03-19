import { EvaluationGrade } from "../core/Evaluation";

export type WordUpdate = {
  flashcardId: string;
  type: 'word' | 'suggestion';
  grade: EvaluationGrade;
};