import { heuristicStrategy } from "./heuristic";
import { hybridStrategy } from "./hybrid";
import { mlStrategy } from "./ml";
import { oldestStrategy } from "./oldest";
import { randomStrategy } from "./random";

export const strategies = {
  HEURISTIC: heuristicStrategy,
  ML: mlStrategy,
  HYBRID: hybridStrategy,
  RANDOM: randomStrategy,
  OLDEST: oldestStrategy,
};
