import { Session } from "./Session";
import { Word } from "./Word";
import { Evaluation } from "./Evaluation";
import { Suggestion } from "./Suggestion";
import { WordMLState } from "./WordMLState";
import { WordHeuristicState } from "./WordHeuristicState";
import { LanguageCode } from "./Language";

export type InitialLoad = {
  sessions: Session[];
  words: Word[];
  evaluations: Evaluation[];
  suggestions: Suggestion[];
  wordsMLStates: WordMLState[];
  wordsHeuristicStates: WordHeuristicState[];
  mainLang: LanguageCode;
  translationLang: LanguageCode;
};