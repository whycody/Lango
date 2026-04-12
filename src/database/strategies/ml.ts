import { PICKED_SESSION_MODEL_VERSION, SessionModel } from '../../constants/Session';
import { WordSet, WordSetStrategy } from '../../types';
import {
    allocateWordsAndSuggestions,
    mapSuggestionsToSessionWords,
    mapWordsToSessionWords,
    shuffle,
} from '../../utils/strategiesUtils';

export const mlStrategy: WordSetStrategy = (
    size,
    words,
    suggestions,
    _evaluations,
    wordsMLStates,
    _wordsHeuristicStates,
    _lastSessionModel,
    includeSuggestions,
): WordSet => {
    const statesMap = new Map((wordsMLStates ?? []).map(s => [s.wordId, s]));
    const activeWords = words.filter(w => w.active);
    const scoredCandidates = activeWords.map(w => ({
        score: statesMap.get(w.id)?.gradeThreeProb ?? 0,
        word: w,
    }));
    const sortedCandidates = [...scoredCandidates].sort((a, b) => a.score - b.score);
    const candidates = sortedCandidates.slice(0, size);
    const candidateWords = candidates.map(candidate => candidate.word);

    if (!includeSuggestions) {
        return {
            model: SessionModel.ML,
            sessionWords: shuffle(mapWordsToSessionWords(candidateWords)),
            version: PICKED_SESSION_MODEL_VERSION,
        };
    }

    const wellKnownCount = candidates.filter(candidate => candidate.score >= 0.75).length;

    const { suggestionsToAdd, wordsToTake } = allocateWordsAndSuggestions(
        size,
        candidateWords.length,
        suggestions.length,
        wellKnownCount,
    );

    const sessionCandidates = [
        ...mapWordsToSessionWords(candidateWords.slice(0, wordsToTake)),
        ...mapSuggestionsToSessionWords(shuffle(suggestions).slice(0, suggestionsToAdd)),
    ];

    return {
        model: SessionModel.ML,
        sessionWords: shuffle(sessionCandidates),
        version: PICKED_SESSION_MODEL_VERSION,
    };
};
