import { useMemo } from 'react';

import { SessionMode, SessionModel } from '../constants/Session';
import { strategies } from '../database/strategies';
import {
    useAuth,
    useEvaluations,
    useSessions,
    useSuggestions,
    useWords,
    useWordsHeuristicStates,
    useWordsMLStatesContext,
} from '../store';
import { Session, Suggestion, Word, WordSet, WordSetStrategy } from '../types';
import { enhanceWords } from '../utils/enhanceWords';
import { mapSuggestionsToSessionWords, mapWordsToSessionWords } from '../utils/sessionWordMapper';
import { shuffle } from '../utils/shuffle';

const getLastSessionModel = (sessions?: Session[]): SessionModel | undefined =>
    sessions
        ?.filter((s: Session) => s.mode === SessionMode.STUDY)
        .sort(
            (a: Session, b: Session) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )[0]?.sessionModel;

const resolveStrategy = (mode: SessionMode, model: SessionModel): WordSetStrategy => {
    if (mode === SessionMode.OLDEST) return strategies.OLDEST;
    if (mode === SessionMode.RANDOM) return strategies.RANDOM;

    switch (model) {
        case SessionModel.HEURISTIC:
            return strategies.HEURISTIC;
        case SessionModel.ML:
            return strategies.ML;
        case SessionModel.HYBRID:
        default:
            return strategies.HYBRID;
    }
};

const buildFallbackSet = (size: number, words: Word[], suggestions: Suggestion[]) =>
    shuffle([
        ...mapWordsToSessionWords(words),
        ...mapSuggestionsToSessionWords(shuffle(suggestions).slice(0, size - words.length)),
    ]);

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

        const enhanced = enhanceWords(shuffle(strategy.sessionWords), langWordsMLStates);

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
