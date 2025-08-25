import { Word } from "./Word";
import { WordMLState } from "./WordMLState";
import { SESSION_MODEL } from "./User";
import { WordHeuristicState } from "./WordHeuristicState";

export type WordSetStrategy = (
  size: number,
  words: Word[],
  wordsMLStates: WordMLState[],
  wordsHeuristicStates: WordHeuristicState[],
  lastSessionModel?: SESSION_MODEL
) => WordSet;

export type WordSet = {
  words: Word[];
  model: SESSION_MODEL;
}