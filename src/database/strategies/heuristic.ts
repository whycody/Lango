import { SessionModel, SessionModelVersion } from '../../constants/Session';
import { Word, WordSet, WordSetStrategy } from '../../types';
import {
    allocateWordsAndSuggestions,
    mapSuggestionsToSessionWords,
    mapWordsToSessionWords,
    shuffle,
} from '../../utils/strategiesUtils';

export const heuristicStrategy: WordSetStrategy = (
    size,
    words,
    suggestions,
    _evaluations,
    _wordsMLStates,
    wordsHeuristicStates,
    _lastSessionModel,
    includeSuggestions,
): WordSet => {
    const now = Date.now();
    const sortedCandidates = [...wordsHeuristicStates].sort(
        (a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime(),
    );
    const candidates = sortedCandidates.slice(0, size);
    const activeWordsById = new Map(words.filter(w => w.active).map(w => [w.id, w]));
    const candidateWords = candidates
        .map(candidate => activeWordsById.get(candidate.wordId))
        .filter(Boolean) as Word[];

    if (!includeSuggestions) {
        return {
            model: SessionModel.HEURISTIC,
            sessionWords: shuffle(mapWordsToSessionWords(candidateWords)),
            version: SessionModelVersion.H1,
        };
    }

    const wellKnownCount = candidates.filter(
        candidate => candidate.studyCount > 2 && new Date(candidate.nextReviewDate).getTime() > now,
    ).length;

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
        model: SessionModel.HEURISTIC,
        sessionWords: shuffle(sessionCandidates),
        version: SessionModelVersion.H1,
    };
};
