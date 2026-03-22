import { SessionWord, Suggestion, Word } from '../types';

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
