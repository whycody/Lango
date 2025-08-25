import { SESSION_MODEL } from "../store/types";
import { WordSet, WordSetStrategy } from "../store/types/WordSet";
import { mlStrategy } from "./ml";
import { heuristicStrategy } from "./heuristic";

export const hybridStrategy: WordSetStrategy = (size, words, mlStates, heuristicStates, lastSessionModel): WordSet => {
  if (lastSessionModel === SESSION_MODEL.HEURISTIC) {
    return mlStrategy(size, words, mlStates, heuristicStates);
  }
  return heuristicStrategy(size, words, mlStates, heuristicStates);
};