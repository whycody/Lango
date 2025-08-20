import { SESSION_MODEL } from "../store/types";
import { mlStrategy } from "./ml";
import { heuristicStrategy } from "./heuristic";
import { WordSetStrategy } from "../store/types/WordSet";

export const hybridStrategy: WordSetStrategy = (size, mode, words, wordDetails, lastSessionModel) => {
  if (lastSessionModel === SESSION_MODEL.HEURISTIC) {
    return mlStrategy(size, mode, words, wordDetails);
  }
  return heuristicStrategy(size, mode, words, wordDetails);
};