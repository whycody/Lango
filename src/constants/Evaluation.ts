export enum EvaluationGrade {
    BAD = 1,
    MEDIUM = 2,
    GOOD = 3,
}

export const GRADE_THREE_PROB_THRESHOLDS = {
    BAD_MAX: 0.4,
    GOOD_MIN: 0.6,
} as const;
