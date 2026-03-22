import {
  Word,
  Session,
  Evaluation,
  Suggestion,
  WordMLState,
  WordHeuristicState,
} from "..";

export type InitialLoad = {
  sessions: Session[];
  words: Word[];
  evaluations: Evaluation[];
  suggestions: Suggestion[];
  wordsMLStates: WordMLState[];
  wordsHeuristicStates: WordHeuristicState[];
};
