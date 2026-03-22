import { SessionModel } from '../../constants/Session';
import { Evaluation, Suggestion, Word, WordHeuristicState, WordMLState, WordSet } from '..';

export type WordSetStrategy = (
    size: number,
    words: Word[],
    suggestions: Suggestion[],
    evaluations: Evaluation[],
    wordsMLStates: WordMLState[],
    wordsHeuristicStates: WordHeuristicState[],
    lastSessionModel?: SessionModel,
) => WordSet;
