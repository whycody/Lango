import React, { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUpdatedWords, syncWordsOnServer } from "../api/apiClient";
import { useWordsRepository } from "../hooks/repo/useWordsRepository";
import uuid from 'react-native-uuid';
import { Word } from './types';
import { useLanguage } from "./LanguageContext";
import {
  findChangedItems,
  findLatestUpdatedAt,
  getUnsyncedItems,
  mergeLocalAndServer,
  syncInBatches,
  updateLocalItems
} from "../utils/sync";
import { useAppInitializer } from "./AppInitializerContext";

interface WordsContextProps {
  words: Word[];
  loading: boolean;
  langWords: Word[];
  addWord: (text: string, translation: string, source?: string) => Word | null;
  getWord: (id: string) => Word | undefined;
  editWord: (id: string, text: string, translation: string) => void;
  removeWord: (id: string) => void;
  deleteWords: () => void;
  syncWords: () => Promise<void>;
}

export const USER = 'user';
export const LANGO = 'lango';

const WordsContext = createContext<WordsContextProps>({
  words: [],
  loading: true,
  langWords: [],
  addWord: () => null,
  getWord: () => undefined,
  editWord: () => [],
  removeWord: () => [],
  deleteWords: () => [],
  syncWords: () => Promise.resolve(),
});

export const WordsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { initialLoad } = useAppInitializer();
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<Word[]>(initialLoad.words);
  const { mainLang, translationLang } = useLanguage();
  const { saveWords, getAllWords, updateWord } = useWordsRepository();
  const langWords = words.filter((word) => word.mainLang == mainLang && word.translationLang == translationLang);

  const createWord = (text: string, translation: string, source: string): Word => ({
    id: uuid.v4(),
    text,
    translation,
    mainLang,
    translationLang,
    source: source,
    addDate: new Date().toISOString(),
    active: true,
    removed: false,
    synced: false,
    updatedAt: null,
    locallyUpdatedAt: new Date().toISOString(),
  });

  const addWord = (text: string, translation: string, source: string) => {
    if (words.find((word) => word.text === text && word.translation === translation)) return null;
    const newWord = createWord(text, translation, source);
    const updatedWords = [newWord, ...words];
    syncWords(updatedWords);
    setWords(updatedWords);
    saveWords([newWord]);
    return newWord;
  };

  const getWord = (id: string): Word | undefined => words.find(word => word.id === id);

  const editWord = (id: string, text: string, translation: string) => {
    const updatedAt = new Date().toISOString();
    const updatedWords = words.map(word =>
      word.id === id ? { ...word, text, translation, synced: false, locallyUpdatedAt: updatedAt } : word
    );

    updateWord(updatedWords.find(word => word.id === id)!);
    setWords(updatedWords);
    syncWords(updatedWords);
  };

  const removeWord = (id: string) => {
    const updatedWords = words.map(word => {
      if (word.id === id) {
        return { ...word, synced: false, removed: true, locallyUpdatedAt: new Date().toISOString() };
      }
      return word;
    });

    updateWord(updatedWords.find(word => word.id === id)!);
    setWords(updatedWords);
    syncWords(updatedWords);
  };

  const loadWords = async () => {
    try {
      await syncWords(initialLoad.words);
    } catch (error) {
      console.log('Error loading words from storage:', error);
    }
  };

  const syncWords = async (inputWords?: Word[]) => {
    try {
      const wordsList = inputWords ?? (await getAllWords());
      const unsyncedWords = getUnsyncedItems<Word>(wordsList);
      const serverUpdates = await syncInBatches<Word>(unsyncedWords, syncWordsOnServer);

      if (!serverUpdates) return;

      const updatedWords = updateLocalItems<Word>(wordsList, serverUpdates);
      const serverWords = await fetchNewWords(updatedWords);
      const mergedWords = mergeLocalAndServer<Word>(updatedWords, serverWords);
      const changedWords = findChangedItems<Word>(wordsList, mergedWords);

      if (changedWords.length > 0) {
        setWords(mergedWords);
        await saveWords(changedWords);
      }
    } catch (error) {
      console.log("Error syncing words:", error);
    }
  };

  const fetchNewWords = async (updatedWords: Word[]): Promise<Word[]> => {
    const latestUpdatedAt = findLatestUpdatedAt<Word>(updatedWords);
    return await fetchUpdatedWords(latestUpdatedAt);
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

  const loadData = async () => {
    try {
      setLoading(true);
      await loadWords();
    } catch (error) {
      console.log('Error loading words from storage:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [translationLang, mainLang]);

  return (
    <WordsContext.Provider
      value={{
        words,
        loading,
        langWords,
        addWord,
        getWord,
        editWord,
        removeWord,
        deleteWords,
        syncWords,
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