import { EvaluationGrade } from '../../constants/Evaluation';

export type WordUpdate = {
    flashcardId: string;
    grade: EvaluationGrade;
    type: 'word' | 'suggestion';
};
