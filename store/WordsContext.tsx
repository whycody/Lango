import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from "../hooks/useLanguage";

export interface Word {
  id: string;
  text: string;
  translation: string;
  firstLang: string;
  secondLang: string;
  source: string;
  interval: number;
  repetitionCount: number;
  nextReviewDate: string;
  EF: number;
}

interface WordsContextProps {
  words: Word[];
  langWords: Word[];
  addWord: (text: string, translation: string, source?: string) => boolean;
  getWord: (id: string) => Word | undefined;
  editWord: (id: string, text: string, translation: string) => void;
  removeWord: (id: string) => void;
  updateWord: (id: string, grade: number) => void;
  updateFlashcards: (updates: FlashcardUpdate[]) => void;
  getWordSet: (size: number) => Word[];
  deleteWords: () => void;
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
  editWord: () => {},
  removeWord: () => {},
  updateWord: () => {},
  updateFlashcards: () => {},
  getWordSet: () => [],
  deleteWords: () => {},
});

export const WordsProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [words, setWords] = useState<Word[]>([]);
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
    repetitionCount: 0,
    nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    EF: 2.5,
  });

  const addWord = (text: string, translation: string, source: string) => {
    if (words.find((word) => word.text === text && word.translation === translation)) return false;
    const newWord = createWord(text, translation, source);
    const updatedWords = [...words, newWord];
    setWords(updatedWords);
    saveWords(updatedWords);
    return true;
  };

  const getWord = (id: string): Word | undefined => {
    return words.find(word => word.id === id);
  };

  const editWord = (id: string, text: string, translation: string) => {
    const updatedWords = words.map(word => {
      if (word.id === id) {
        return { ...word, text, translation };
      }
      return word;
    });

    setWords(updatedWords);
    saveWords(updatedWords);
  };

  const removeWord = (id: string) => {
    const updatedWords = words.filter(word => word.id !== id);

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

  const loadWords = async () => {
    try {
      const storedWords = await AsyncStorage.getItem('words');
      const parsedWords = storedWords ? JSON.parse(storedWords) : [];
      setWords(parsedWords);
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

  const updateWord = (id: string, grade: number) => {
    const now = new Date();
    const updatedWords = words.map(word => {
      if (word.id === id) {
        let { interval, EF, repetitionCount } = word;
        if (grade < 3) {
          repetitionCount = 0;
          interval = 1;
        } else {
          repetitionCount += 1;
          if (repetitionCount === 1) {
            interval = 1;
          } else if (repetitionCount === 2) {
            interval = 6;
          } else {
            interval = Math.round(interval * EF);
          }
        }

        EF = Math.max(1.3, EF + 0.1 - (3 - grade) * (0.08 + (3 - grade) * 0.02));
        const nextReviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString();
        return { ...word, interval, repetitionCount, EF, nextReviewDate };
      }
      return word;
    });

    setWords(updatedWords);
    saveWords(updatedWords);
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

        EF = Math.max(1.3, EF - (3 - grade) * (0.08 + (3 - grade) * 0.02));
        const nextReviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString();

        return { ...flashcard, interval, repetitionCount, EF, nextReviewDate };
      }

      return flashcard;
    });

    setWords(updatedFlashcards);
    saveWords(updatedFlashcards);
  };


  const getWordSet = (size: number): Word[] => {
    const now = new Date();

    const sortedWords = [...langWords].sort((a, b) => {
      const dateA = new Date(a.nextReviewDate).getTime();
      const dateB = new Date(b.nextReviewDate).getTime();

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
  }, [languageContext.mainLangCode, languageContext.studyingLangCode]);

  return (
    <WordsContext.Provider
      value={{ words, langWords, addWord, getWord, editWord, removeWord, updateWord, updateFlashcards, getWordSet, deleteWords }}>
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