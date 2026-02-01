import React, { createContext, FC, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchUpdatedWords, syncWordsOnServer } from "../api/apiClient";
import { useWordsRepository } from "../hooks/repo/useWordsRepository";
import uuid from 'react-native-uuid';
import { Word } from '../types';
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
  addWord: (text: string, translation: string, source?: WordSource) => Word | null;
  getWord: (id: string) => Word | undefined;
  editWord: (updatedWord: Partial<Word>) => void;
  removeWord: (id: string) => void;
  syncWords: () => Promise<void>;
}

export enum WordSource {
  USER = 'user',
  LANGO = 'lango',
}

const WordsContext = createContext<WordsContextProps>({
  words: [],
  loading: true,
  langWords: [],
  addWord: () => null,
  getWord: () => undefined,
  editWord: () => [],
  removeWord: () => [],
  syncWords: () => Promise.resolve(),
});

export const WordsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { initialLoad } = useAppInitializer();
  const [loading, setLoading] = useState(false);
  const [words, setWords] = useState<Word[]>(initialLoad.words);
  const { mainLang, translationLang } = useLanguage();
  const { saveWords, getAllWords, updateWord } = useWordsRepository();
  const syncing = useRef(false);

  const langWords = useMemo(() => words.filter((word) =>
    !word.removed && word.mainLang == mainLang && word.translationLang == translationLang
  ), [words, mainLang, translationLang]);

  const createWord = (text: string, translation: string, source: WordSource): Word => ({
    id: uuid.v4(),
    text,
    translation,
    mainLang,
    translationLang,
    source,
    addDate: new Date().toISOString(),
    active: true,
    removed: false,
    synced: false,
    updatedAt: null,
    locallyUpdatedAt: new Date().toISOString(),
  });

  const addWord = (text: string, translation: string, source: WordSource) => {
    const word = words.find((word) => word.text === text && word.translation === translation);
    if (word) {
      editWord({ id: word.id, removed: false });
      return null;
    }
    const newWord = createWord(text, translation, source);
    const updatedWords = [newWord, ...words];
    syncWords(updatedWords);
    setWords(updatedWords);
    saveWords([newWord]);
    return newWord;
  };

  const getWord = (id: string): Word | undefined => words.find(word => word.id === id);

  const editWord = (updatedWord: Partial<Word>) => {
    const updatedAt = new Date().toISOString();
    const updatedWords = words.map(word =>
      word.id === updatedWord.id ? { ...word, ...updatedWord, synced: false, locallyUpdatedAt: updatedAt } : word
    );

    updateWord(updatedWords.find(word => word.id === updatedWord.id)!);
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

  const syncWords = async (inputWords?: Word[]) => {
    try {
      if (syncing.current) return;
      syncing.current = true;
      const wordsList = inputWords ?? (await getAllWords());
      const unsyncedWords = getUnsyncedItems<Word>(wordsList);
      const serverUpdates = await syncInBatches<Word>(unsyncedWords, syncWordsOnServer);

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
    } finally {
      syncing.current = false;
    }
  };

  const fetchNewWords = async (updatedWords: Word[]): Promise<Word[]> => {
    const latestUpdatedAt = findLatestUpdatedAt<Word>(updatedWords);
    return await fetchUpdatedWords(latestUpdatedAt);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await syncWords();
    } catch (error) {
      console.log('Error loading words from storage:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

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