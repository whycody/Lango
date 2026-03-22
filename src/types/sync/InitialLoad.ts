import { Evaluation, Session, Suggestion, Word, WordHeuristicState, WordMLState } from '..';

export type InitialLoad = {
    evaluations: Evaluation[];
    sessions: Session[];
    suggestions: Suggestion[];
    words: Word[];
    wordsHeuristicStates: WordHeuristicState[];
    wordsMLStates: WordMLState[];
};
