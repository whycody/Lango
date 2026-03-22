import { heuristicStrategy, hybridStrategy, mlStrategy, oldestStrategy, randomStrategy } from '.';

export const strategies = {
    HEURISTIC: heuristicStrategy,
    HYBRID: hybridStrategy,
    ML: mlStrategy,
    OLDEST: oldestStrategy,
    RANDOM: randomStrategy,
};
