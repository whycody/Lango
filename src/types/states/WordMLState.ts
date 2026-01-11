import { EvaluationGrade } from "../core/Evaluation";

export type WordMLState = {
  wordId: string;
  hoursSinceLastRepetition: number;
  studyDuration: number;
  studyStreak: number;
  gradesAverage: number;
  repetitionsCount: number;
  gradesTrend: number;
  predictedGrade: EvaluationGrade;
  gradeThreeProb: number;
}