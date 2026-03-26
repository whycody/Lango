import { useMemo } from 'react';

import { SessionMode, SessionModel } from '../constants/Session';
import {
    heuristicStrategy,
    hybridStrategy,
    mlStrategy,
    oldestStrategy,
    randomStrategy,
} from '../database/strategies';
import { useAuth } from '../store/AuthContext';
import { useEvaluations } from '../store/EvaluationsContext';
import { useSessions } from '../store/SessionsContext';
import { useSuggestions } from '../store/SuggestionsContext';
import { useWords } from '../store/WordsContext';
import { useWordsHeuristicStates } from '../store/WordsHeuristicStatesContext';
import { useWordsMLStatesContext } from '../store/WordsMLStatesContext';
import { Session, WordSet, WordSetStrategy } from '../types';
import { buildFallbackSet, enhanceWords } from '../utils/strategiesUtils';

const STRATEGIES = {
    HEURISTIC: heuristicStrategy,
    HYBRID: hybridStrategy,
    ML: mlStrategy,
    OLDEST: oldestStrategy,
    RANDOM: randomStrategy,
};

const getLastSessionModel = (sessions?: Session[]): SessionModel | undefined =>
    sessions
        ?.filter((s: Session) => s.mode === SessionMode.STUDY)
        .sort(
            (a: Session, b: Session) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )[0]?.sessionModel;

const resolveStrategy = (mode: SessionMode, model: SessionModel): WordSetStrategy => {
    if (mode === SessionMode.OLDEST) return STRATEGIES.OLDEST;
    if (mode === SessionMode.RANDOM) return STRATEGIES.RANDOM;

    switch (model) {
        case SessionModel.HEURISTIC:
            return STRATEGIES.HEURISTIC;
        case SessionModel.ML:
            return STRATEGIES.ML;
        case SessionModel.HYBRID:
        default:
            return STRATEGIES.HYBRID;
    }
};

export const useWordSet = (size: number, mode: SessionMode): WordSet => {
    const { langWords } = useWords();
    const { langSuggestions } = useSuggestions();
    const { evaluations } = useEvaluations();
    const { langWordsMLStates } = useWordsMLStatesContext();
    const { langWordsHeuristicStates } = useWordsHeuristicStates();
    const { sessions } = useSessions();
    const { user } = useAuth();

    return useMemo(() => {
        const lastSessionModel = getLastSessionModel(sessions);
        const currentModel = user.sessionModel || SessionModel.HYBRID;

        const strategyFactory = resolveStrategy(mode, currentModel);

        const strategy = strategyFactory(
            size,
            langWords,
            langSuggestions,
            evaluations,
            langWordsMLStates,
            langWordsHeuristicStates,
            lastSessionModel,
        );

        if (langWords.length < size || !evaluations?.length) {
            const fallbackSet = buildFallbackSet(size, langWords, langSuggestions);
            const enhanced = enhanceWords(fallbackSet, langWordsMLStates);
            return {
                model: strategy.model,
                sessionWords: enhanced,
                version: strategy.version,
            };
        }

        const enhanced = enhanceWords(strategy.sessionWords, langWordsMLStates);

        return {
            model: strategy.model,
            sessionWords: enhanced,
            version: strategy.version,
        };
    }, [
        user.sessionModel,
        langWords,
        langSuggestions,
        evaluations?.length ?? 0,
        langWordsMLStates,
        langWordsHeuristicStates,
        sessions,
        size,
        mode,
    ]);
};
