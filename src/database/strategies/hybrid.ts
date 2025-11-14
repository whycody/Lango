import { SESSION_MODEL } from "../../types";
import { WordSet, WordSetStrategy } from "../../types/WordSet";
import { mlStrategy } from "./ml";
import { heuristicStrategy } from "./heuristic";

export const hybridStrategy: WordSetStrategy = (size, words, evaluations, mlStates, heuristicStates, lastSessionModel): WordSet => {
  if (lastSessionModel === SESSION_MODEL.HEURISTIC) {
    return mlStrategy(size, words, evaluations, mlStates, heuristicStates);
  }
  return heuristicStrategy(size, words, evaluations, mlStates, heuristicStates);
};