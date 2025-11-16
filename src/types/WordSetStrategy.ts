import { Word } from "./Word";
import { Evaluation } from "./Evaluation";
import { WordMLState } from "./WordMLState";
import { WordHeuristicState } from "./WordHeuristicState";
import { SESSION_MODEL } from "./User";
import { WordSet } from "./WordSet";

export type WordSetStrategy = (
  size: number,
  words: Word[],
  evaluations: Evaluation[],
  wordsMLStates: WordMLState[],
  wordsHeuristicStates: WordHeuristicState[],
  lastSessionModel?: SESSION_MODEL
) => WordSet;