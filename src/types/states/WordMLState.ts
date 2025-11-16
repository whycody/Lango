export type WordMLState = {
  wordId: string;
  hoursSinceLastRepetition: number;
  studyDuration: number;
  studyStreak: number;
  gradesAverage: number;
  repetitionsCount: number;
  gradesTrend: number;
  predictedGrade: 1 | 2 | 3;
  gradeThreeProb: number;
}