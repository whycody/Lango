import { SessionWord, Suggestion, Word } from "../types";

export const mapWordsToSessionWords = (words: Word[]): SessionWord[] => {
  return words.map((w) => ({
    id: w.id,
    type: "word",
    text: w.text,
    translation: w.translation,
    mainLang: w.mainLang,
    translationLang: w.translationLang,
    addDate: w.addDate,
    tags: [],
  }));
};

export const mapSuggestionsToSessionWords = (
  suggestions: Suggestion[],
): SessionWord[] => {
  return suggestions.map((s) => ({
    id: s.id,
    type: "suggestion",
    text: s.word,
    translation: s.translation,
    mainLang: s.mainLang,
    translationLang: s.translationLang,
    addDate: s.updatedAt,
    tags: [],
  }));
};
