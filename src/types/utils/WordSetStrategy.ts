import { Word } from "../core/Word";
import { Evaluation } from "../core/Evaluation";
import { WordMLState } from "../states/WordMLState";
import { WordHeuristicState } from "../states/WordHeuristicState";
import { SESSION_MODEL } from "../core/User";
import { WordSet } from "../core/WordSet";

export type WordSetStrategy = (
  size: number,
  words: Word[],
  evaluations: Evaluation[],
  wordsMLStates: WordMLState[],
  wordsHeuristicStates: WordHeuristicState[],
  lastSessionModel?: SESSION_MODEL
) => WordSet;