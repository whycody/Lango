import { SessionModel } from '../../constants/Session';
import { WordSet, WordSetStrategy } from '../../types';
import { heuristicStrategy } from './heuristic';
import { mlStrategy } from './ml';

export const hybridStrategy: WordSetStrategy = (
    size,
    words,
    suggestions,
    evaluations,
    mlStates,
    heuristicStates,
    lastSessionModel,
    includeSuggestions,
): WordSet => {
    if (lastSessionModel === SessionModel.HEURISTIC) {
        return mlStrategy(
            size,
            words,
            suggestions,
            evaluations,
            mlStates,
            heuristicStates,
            lastSessionModel,
            includeSuggestions,
        );
    }
    return heuristicStrategy(
        size,
        words,
        suggestions,
        evaluations,
        mlStates,
        heuristicStates,
        lastSessionModel,
        includeSuggestions,
    );
};
