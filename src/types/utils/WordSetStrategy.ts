import { Word } from "../core/Word";
import { Evaluation } from "../core/Evaluation";
import { WordMLState } from "../states/WordMLState";
import { WordHeuristicState } from "../states/WordHeuristicState";
import { SessionModel } from "../core/User";
import { WordSet } from "../core/WordSet";
import { Suggestion } from "../core/Suggestion";

export type WordSetStrategy = (
  size: number,
  words: Word[],
  suggestions: Suggestion[],
  evaluations: Evaluation[],
  wordsMLStates: WordMLState[],
  wordsHeuristicStates: WordHeuristicState[],
  lastSessionModel?: SessionModel,
) => WordSet;
