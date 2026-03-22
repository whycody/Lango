import { EvaluationGrade } from "../../constants/Evaluation";

export type WordUpdate = {
  flashcardId: string;
  type: "word" | "suggestion";
  grade: EvaluationGrade;
};
