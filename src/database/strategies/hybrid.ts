import { SESSION_MODEL } from "../../types";
import { WordSet } from "../../types/core/WordSet";
import { mlStrategy } from "./ml";
import { heuristicStrategy } from "./heuristic";
import { WordSetStrategy } from "../../types/utils/WordSetStrategy";

export const hybridStrategy: WordSetStrategy = (size, words, evaluations, mlStates, heuristicStates, lastSessionModel): WordSet => {
  if (lastSessionModel === SESSION_MODEL.HEURISTIC) {
    return mlStrategy(size, words, evaluations, mlStates, heuristicStates);
  }
  return heuristicStrategy(size, words, evaluations, mlStates, heuristicStates);
};