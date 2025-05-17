import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from "../hooks/useLanguage";
import { fetchUpdatedWords, syncWordsOnServer } from "../hooks/useApi";
import { SESSION_MODE } from "./UserPreferencesContext";

export interface Word {
  id: string;
  text: string;
  translation: string;
  firstLang: string;
  secondLang: string;
  source: string;
  interval: number;
  addDate: string;
  repetitionCount: number;
  lastReviewDate: string;
  nextReviewDate: string;
  EF: number;
  active: boolean;
  removed: boolean;
  synced: boolean;
  updatedAt?: string;
  locallyUpdatedAt: string;
}

export interface Evaluation {
  id: string;
  wordId: string;
  grade: number;
  date: Date;
}

interface WordsContextProps {
  words: Word[];
  langWords: Word[];
  addWord: (text: string, translation: string, source?: string) => boolean;
  getWord: (id: string) => Word | undefined;
  editWord: (id: string, text: string, translation: string) => void;
  removeWord: (id: string) => void;
  updateFlashcards: (updates: FlashcardUpdate[]) => void;
  getWordSet: (size: number, sessionMode: SESSION_MODE) => Word[];
  deleteWords: () => void;
  evaluationsNumber: number;
}

export const USER = 'user';
export const LANGO = 'lango';

export type FlashcardUpdate = {
  flashcardId: string;
  grade: 1 | 2 | 3;
};

export const WordsContext = createContext<WordsContextProps>({
  words: [],
  langWords: [],
  addWord: () => true,
  getWord: () => undefined,
  editWord: () => {
  },
  removeWord: () => {
  },
  updateFlashcards: () => {
  },
  getWordSet: () => [],
  deleteWords: () => {
  },
  evaluationsNumber: 0,
});

export const WordsProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const languageContext = useLanguage();
  const langWords = words.filter((word) =>
    word.firstLang == languageContext.studyingLangCode && word.secondLang == languageContext.mainLangCode);

  const createWord = (text: string, translation: string, source: string): Word => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    text,
    translation,
    firstLang: languageContext.studyingLangCode,
    secondLang: languageContext.mainLangCode,
    source: source,
    interval: 1,
    addDate: new Date().toISOString(),
    repetitionCount: 0,
    lastReviewDate: new Date(Date.now()).toISOString(),
    nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    EF: 2.5,
    active: true,
    removed: false,
    synced: false,
    updatedAt: null,
    locallyUpdatedAt: new Date().toISOString(),
  });

  const createEvaluation = (wordId: string, grade: number): Evaluation => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    wordId,
    grade,
    date: new Date()
  });

  const addWord = (text: string, translation: string, source: string) => {
    if (words.find((word) => word.text === text && word.translation === translation)) return false;
    const newWord = createWord(text, translation, source);
    const updatedWords = [newWord, ...words];
    syncWords(updatedWords);
    setWords(updatedWords);
    saveWords(updatedWords);
    return true;
  };

  const addEvaluations = (flashcardsUpdates: FlashcardUpdate[]) => {
    const newEvaluations = flashcardsUpdates.map(update => createEvaluation(update.flashcardId, update.grade));
    const updatedEvaluations = [...evaluations, ...newEvaluations];
    setEvaluations(updatedEvaluations);
    saveEvaluations(updatedEvaluations);
    return true;
  };

  const getWord = (id: string): Word | undefined => {
    return words.find(word => word.id === id);
  };

  const editWord = (id: string, text: string, translation: string) => {
    const updatedWords = words.map(word => {
      if (word.id === id) {
        return { ...word, text, translation, synced: false, locallyUpdatedAt: new Date().toISOString() };
      }
      return word;
    });

    syncWords(updatedWords);
    setWords(updatedWords);
    saveWords(updatedWords);
  };

  const removeWord = (id: string) => {
    const updatedWords = words.map(word => {
      if (word.id === id) {
        return { ...word, synced: false, removed: true, locallyUpdatedAt: new Date().toISOString() };
      }
      return word;
    });

    syncWords(updatedWords);
    setWords(updatedWords);
    saveWords(updatedWords);
  };

  const saveWords = async (wordsToSave: Word[] = words) => {
    try {
      await AsyncStorage.setItem('words', JSON.stringify(wordsToSave));
    } catch (error) {
      console.log('Error saving words to storage:', error);
    }
  };

  const saveEvaluations = async (evaluationsToSave: Evaluation[] = evaluations) => {
    try {
      await AsyncStorage.setItem('evaluations', JSON.stringify(evaluationsToSave));
    } catch (error) {
      console.log('Error saving evaluations to storage:', error);
    }
  };

  const loadWords = async () => {
    try {
      const storedWords = await AsyncStorage.getItem('words');
      const parsedWords = storedWords ? JSON.parse(storedWords) : [];
      const wordsToLoad = parsedWords.map((word: Word) => ({
        ...word,
        active: word.active ?? true,
        removed: word.removed ?? false,
        locallyUpdatedAt: word.locallyUpdatedAt ?? new Date().toISOString(),
      }));

      setWords(wordsToLoad);
      await syncWords(wordsToLoad);
    } catch (error) {
      console.log('Error loading words from storage:', error);
    }
  };

  const syncWords = async (inputWords?: Word[]) => {
    const wordsList = inputWords ?? words;
    const unsyncedWords = wordsList.filter(word => !word.synced);
    const res = await syncWordsOnServer(unsyncedWords);

    if (res) {
      const updatesMap = new Map(res.map((u: { id: string, updatedAt: string }) => [u.id, u.updatedAt]));

      const updatedWords = wordsList.map(word => {
        if (updatesMap.has(word.id)) {
          const serverUpdatedAt = updatesMap.get(word.id) as string;
          return {
            ...word,
            synced: true,
            updatedAt: serverUpdatedAt,
            locallyUpdatedAt: serverUpdatedAt
          };
        }
        return word;
      });

      const latestUpdatedAt = new Date(
        Math.max(...updatedWords.map(word => new Date(word.updatedAt).getTime()), 0)
      ).toISOString();

      const serverWords = await fetchUpdatedWords(latestUpdatedAt);
      const serverWordsMap = new Map(serverWords.map(sw => [sw.id, sw]));

      const mergedWords = updatedWords.map(word => {
        if (serverWordsMap.has(word.id)) {
          const serverWord = serverWordsMap.get(word.id) as Word;
          return {
            ...serverWord,
            synced: true,
            locallyUpdatedAt: serverWord.updatedAt,
            updatedAt: serverWord.updatedAt
          };
        }
        return word;
      });

      setWords(mergedWords);
      await saveWords(mergedWords);
    }
  };

  const loadEvaluations = async () => {
    try {
      const storedEvaluations = await AsyncStorage.getItem('evaluations');
      const parsedEvaluations = storedEvaluations ? JSON.parse(storedEvaluations) : [];
      setEvaluations(parsedEvaluations);
    } catch (error) {
      console.log('Error loading words from storage:', error);
    }
  };

  const deleteWords = async () => {
    try {
      await AsyncStorage.removeItem('words');
      setWords([]);
      console.log('All words have been deleted from storage.');
    } catch (error) {
      console.log('Error deleting words from storage:', error);
    }
  };

  const updateFlashcards = (updates: FlashcardUpdate[]) => {
    const now = new Date();
    const updatedFlashcards = words.map(flashcard => {
      const update = updates.find(u => u.flashcardId === flashcard.id);

      if (update) {
        let { interval, EF, repetitionCount } = flashcard;
        const { grade } = update;

        if (grade === 1) {
          repetitionCount = 0;
          interval = 1;
        } else {
          repetitionCount += 1;

          if (repetitionCount === 1) {
            interval = 1;
          } else if (repetitionCount === 2) {
            interval = 3;
          } else if (repetitionCount === 3) {
            interval = 6;
          } else {
            interval = Math.round(interval * EF);
          }
        }

        EF = grade === 3
          ? Math.min(2.5, EF + 0.1)
          : Math.max(1.3, EF - (3 - grade) * (0.08 + (3 - grade) * 0.02));

        const lastReviewDate = new Date(Date.now()).toISOString();
        const nextReviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString();

        return { ...flashcard, interval, repetitionCount, EF, lastReviewDate, nextReviewDate, synced: false };
      }

      return flashcard;
    });

    addEvaluations(updates.filter((update: FlashcardUpdate) =>
      words.find((word) => word.id === update.flashcardId).addDate));

    setWords(updatedFlashcards);
    saveWords(updatedFlashcards);
    syncWords(updatedFlashcards);
  };

  const getWordSet = (size: number, mode: SESSION_MODE): Word[] => {
    const now = new Date();

    const sortedWords = [...langWords].filter((word: Word) => word.active).sort((a, b) => {
      if (mode == SESSION_MODE.RANDOM) return Math.random() - 0.5;
      const dateA = new Date(mode == SESSION_MODE.STUDY ? a.nextReviewDate : a.lastReviewDate).getTime();
      const dateB = new Date(mode == SESSION_MODE.STUDY ? b.nextReviewDate : b.lastReviewDate).getTime();

      if (dateA !== dateB) return dateA - dateB;
      return a.repetitionCount - b.repetitionCount;
    });

    const reviewWords = sortedWords.filter(word => new Date(word.nextReviewDate) <= now);
    return reviewWords.length >= size
      ? reviewWords.slice(0, size).sort(() => Math.random() - 0.5)
      : [...reviewWords, ...sortedWords.slice(reviewWords.length, size)].slice(0, size).sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    loadWords();
    loadEvaluations();
  }, [languageContext.mainLangCode, languageContext.studyingLangCode]);

  return (
    <WordsContext.Provider
      value={{
        words,
        langWords,
        addWord,
        getWord,
        editWord,
        removeWord,
        updateFlashcards,
        getWordSet,
        deleteWords,
        evaluationsNumber: evaluations.length
      }}
    >
      {children}
    </WordsContext.Provider>
  );
};

export const useWords = (): WordsContextProps => {
  const context = useContext(WordsContext);
  if (!context) {
    throw new Error("useWords must be used within a WordsProvider");
  }
  return context;
};

export default WordsProvider;