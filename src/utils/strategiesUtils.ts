import { DAY_IN_MS } from '../constants/Date';
import { NEW_SUGGESTIONS_RATIO } from '../constants/Strategies';
import { SessionWord, Suggestion, Word, WordMLState, WordTag } from '../types';
import { getTimeDifferenceMs } from './dateUtil';

export const allocateWordsAndSuggestions = (
    size: number,
    candidatesLength: number,
    suggestionsLength: number,
    wellKnownCount: number,
) => {
    let suggestionsToAdd = Math.min(
        Math.floor(size * NEW_SUGGESTIONS_RATIO),
        wellKnownCount,
        suggestionsLength,
    );

    let wordsToTake = size - suggestionsToAdd;

    if (candidatesLength < wordsToTake) {
        const missing = wordsToTake - candidatesLength;
        suggestionsToAdd = Math.min(suggestionsLength, suggestionsToAdd + missing);
        wordsToTake = size - suggestionsToAdd;
    }

    return { suggestionsToAdd, wordsToTake };
};

export const mapWordsToSessionWords = (words: Word[]): SessionWord[] => {
    return words.map(w => ({
        addDate: w.addDate,
        id: w.id,
        mainLang: w.mainLang,
        tags: [],
        text: w.text,
        translation: w.translation,
        translationLang: w.translationLang,
        type: 'word',
    }));
};

export const mapSuggestionsToSessionWords = (suggestions: Suggestion[]): SessionWord[] => {
    return suggestions.map(s => ({
        addDate: s.updatedAt,
        id: s.id,
        mainLang: s.mainLang,
        tags: [],
        text: s.word,
        translation: s.translation,
        translationLang: s.translationLang,
        type: 'suggestion',
    }));
};

export const buildFallbackSet = (size: number, words: Word[], suggestions: Suggestion[]) => {
    const wordsToTake = Math.min(size, words.length);
    const suggestionsToTake = Math.max(0, size - wordsToTake);

    return shuffle([
        ...mapWordsToSessionWords(words).slice(0, wordsToTake),
        ...mapSuggestionsToSessionWords(shuffle(suggestions).slice(0, suggestionsToTake)),
    ]);
};

export const enhanceWords = (
    sessionWords: SessionWord[],
    mlStates: WordMLState[],
): SessionWord[] => {
    const mlMap = new Map(mlStates.map(s => [s.wordId, s]));

    return sessionWords.map(word => {
        const state = mlMap.get(word.id);
        const tags: WordTag[] = [];

        if (!state) return { ...word, tags };

        const {
            gradeThreeProb,
            gradesAverage,
            gradesTrend,
            hoursSinceLastRepetition,
            repetitionsCount,
            studyStreak,
        } = state;

        const elapsedMs = getTimeDifferenceMs(word.addDate);
        const isRecentlyAdded = elapsedMs !== null && elapsedMs <= 3 * DAY_IN_MS;

        const tagsToAdd: { condition: boolean; tag: WordTag }[] = [
            { condition: gradesTrend > 0.1, tag: 'improving' },
            { condition: repetitionsCount < 5 && gradeThreeProb < 0.85, tag: 'in_progress' },
            { condition: isRecentlyAdded, tag: 'recently_added' },
            { condition: hoursSinceLastRepetition > 24 * 14, tag: 'long_time_no_see' },
            { condition: repetitionsCount > 10, tag: 'frequently_repeated' },
            { condition: gradeThreeProb > 0.8, tag: 'well_known' },
            { condition: studyStreak >= 3, tag: 'streak' },
            { condition: repetitionsCount > 5 && gradesAverage <= 1.5, tag: 'struggling' },
            {
                condition: repetitionsCount > 5 && gradesAverage > 1.5 && gradesAverage <= 2,
                tag: 'often_mistaken',
            },
        ];

        tags.push(...tagsToAdd.filter(({ condition }) => condition).map(({ tag }) => tag));

        return { ...word, tags };
    });
};

export function shuffle<T>(array: T[]): T[] {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
