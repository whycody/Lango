import { EvaluationGrade } from '../../constants/Evaluation';
import { SyncMetadata } from '../sync/SyncMetadata';

export type Evaluation = SyncMetadata & {
    date: string;
    grade: EvaluationGrade;
    id: string;
    sessionId: string;
    wordId: string;
};
