import { heuristicStrategy } from './heuristic';
import { hybridStrategy } from './hybrid';
import { mlStrategy } from './ml';
import { oldestStrategy } from './oldest';
import { randomStrategy } from './random';

export const strategies = {
    HEURISTIC: heuristicStrategy,
    HYBRID: hybridStrategy,
    ML: mlStrategy,
    OLDEST: oldestStrategy,
    RANDOM: randomStrategy,
};
