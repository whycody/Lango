import { EvaluationGrade } from '../../constants/Evaluation';

export type WordMLState = {
    gradeThreeProb: number;
    gradesAverage: number;
    gradesTrend: number;
    hoursSinceLastRepetition: number;
    predictedGrade: EvaluationGrade;
    repetitionsCount: number;
    studyDuration: number;
    studyStreak: number;
    wordId: string;
};
