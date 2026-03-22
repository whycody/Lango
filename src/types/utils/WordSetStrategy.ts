import {
  Word,
  Evaluation,
  WordMLState,
  Suggestion,
  WordHeuristicState,
  WordSet,
} from "..";
import { SessionModel } from "../../constants/Session";

export type WordSetStrategy = (
  size: number,
  words: Word[],
  suggestions: Suggestion[],
  evaluations: Evaluation[],
  wordsMLStates: WordMLState[],
  wordsHeuristicStates: WordHeuristicState[],
  lastSessionModel?: SessionModel,
) => WordSet;
