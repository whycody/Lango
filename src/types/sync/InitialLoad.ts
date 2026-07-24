import {
    Evaluation,
    Session,
    Suggestion,
    Word,
    WordHeuristicState,
    WordMLState,
    WordsBundle,
} from '..';

export type InitialLoad = {
    evaluations: Evaluation[];
    sessions: Session[];
    suggestions: Suggestion[];
    words: Word[];
    wordsBundles: WordsBundle[];
    wordsHeuristicStates: WordHeuristicState[];
    wordsMLStates: WordMLState[];
};
