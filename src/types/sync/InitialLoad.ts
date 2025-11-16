import { Session } from "../core/Session";
import { Word } from "../core/Word";
import { Evaluation } from "../core/Evaluation";
import { Suggestion } from "../core/Suggestion";
import { WordMLState } from "../states/WordMLState";
import { WordHeuristicState } from "../states/WordHeuristicState";

import { LanguageCode } from "../../constants/LanguageCode";

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