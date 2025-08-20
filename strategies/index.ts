import { mlStrategy } from "./ml";
import { hybridStrategy } from "./hybrid";
import { heuristicStrategy } from "./heuristic";

export const strategies = {
  HEURISTIC: heuristicStrategy,
  ML: mlStrategy,
  HYBRID: hybridStrategy,
};
