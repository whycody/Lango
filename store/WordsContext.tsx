import React, { createContext, FC, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  addWord: (text: string, translation: string, source?: string) => void;
  updateWord: (id: string, grade: number) => void;
  getWordSet: (size: number) => Word[];
}

export const USER = 'user';
export const LANGO = 'lango';

export const WordsContext = createContext<WordsContextProps>({
  words: [],
  addWord: () => {},
  updateWord: () => {},
  getWordSet: () => []
});

export const WordsProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [words, setWords] = useState<Word[]>([]);

  const createWord = (text: string, translation: string, source: string = USER): Word => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    text,
    translation,
    firstLang: 'es',
    secondLang: 'pl',
    source: source,
    interval: 1,
    repetitionCount: 0,
    nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    EF: 2.5,
  });

  const addWord = (text: string, translation: string) => {
    if(words.find((word) => word.text === text && word.translation === translation)) return;
    const newWord = createWord(text, translation);
    const updatedWords = [...words, newWord];
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

  const getWordSet = (size: number): Word[] => {
    const now = new Date();

    const sortedWords = [...words].sort((a, b) => {
      const dateA = new Date(a.nextReviewDate).getTime();
      const dateB = new Date(b.nextReviewDate).getTime();

      if (dateA !== dateB) return dateA - dateB;
      return a.repetitionCount - b.repetitionCount;
    });

    const reviewWords = sortedWords.filter(word => new Date(word.nextReviewDate) <= now);
    return reviewWords.length >= size
      ? reviewWords.slice(0, size)
      : [...reviewWords, ...sortedWords.slice(reviewWords.length, size)].slice(0, size);
  };

  useEffect(() => {
    loadWords();
  }, []);

  return (
    <WordsContext.Provider value={{ words, addWord, updateWord, getWordSet }}>
      {children}
    </WordsContext.Provider>
  );
};

export default WordsProvider;