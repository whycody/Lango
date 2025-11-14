import { mlStrategy } from "./ml";
import { hybridStrategy } from "./hybrid";
import { heuristicStrategy } from "./heuristic";
import { randomStrategy } from "./random";
import { oldestStrategy } from "./oldest";

export const strategies = {
  HEURISTIC: heuristicStrategy,
  ML: mlStrategy,
  HYBRID: hybridStrategy,
  RANDOM: randomStrategy,
  OLDEST: oldestStrategy
};
