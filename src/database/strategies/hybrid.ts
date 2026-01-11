import { SessionModel, WordSet, WordSetStrategy } from "../../types";
import { mlStrategy } from "./ml";
import { heuristicStrategy } from "./heuristic";

export const hybridStrategy: WordSetStrategy = (size, words, evaluations, mlStates, heuristicStates, lastSessionModel): WordSet => {
  if (lastSessionModel === SessionModel.HEURISTIC) {
    return mlStrategy(size, words, evaluations, mlStates, heuristicStates);
  }
  return heuristicStrategy(size, words, evaluations, mlStates, heuristicStates);
};