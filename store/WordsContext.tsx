import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUpdatedWords, syncWordsOnServer } from "../api/apiClient";
import { useWordsRepository } from "../hooks/repo/useWordsRepository";
import uuid from 'react-native-uuid';
import { Word } from './types';
import { useLanguage } from "./LanguageContext";

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

export const WordsProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<Word[]>([]);
  const languageContext = useLanguage();
  const { saveWords, getAllWords, updateWord, createTables } = useWordsRepository();
  const langWords = words.filter((word) =>
    word.firstLang == languageContext.studyingLangCode && word.secondLang == languageContext.mainLangCode);

  const createWord = (text: string, translation: string, source: string): Word => ({
    id: uuid.v4(),
    text,
    translation,
    firstLang: languageContext.studyingLangCode,
    secondLang: languageContext.mainLangCode,
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

  const saveWordsFromAsyncStorage = async () => {
    try {
      const storedWords = await AsyncStorage.getItem('words');
      if (!storedWords) return;

      const parsedWords: Word[] = JSON.parse(storedWords);
      const wordsToLoad = parsedWords.map((word) => ({
        ...word,
        synced: false,
        active: word.active ?? true,
        removed: word.removed ?? false,
        locallyUpdatedAt: word.locallyUpdatedAt ?? new Date().toISOString(),
      }));

      await saveWords(wordsToLoad);
      await AsyncStorage.removeItem('words');
      console.log('Migrated words from AsyncStorage to SQLite');
    } catch (error) {
      console.error('Error migrating words from AsyncStorage:', error);
    }
  };

  const loadWords = async () => {
    try {
      const loadedWords = await getAllWords();
      setWords(loadedWords);
      await syncWords(loadedWords);
    } catch (error) {
      console.log('Error loading words from storage:', error);
    }
  };

  const syncWords = async (inputWords?: Word[]) => {
    try {
      const wordsList = inputWords ?? (await getAllWords());
      const unsyncedWords = getUnsyncedWords(wordsList);
      const serverUpdates = await syncUnsyncedWords(unsyncedWords);

      if (!serverUpdates) return;

      const updatedWords = updateLocalWords(wordsList, serverUpdates);
      const serverWords = await fetchNewWords(updatedWords);
      const mergedWords = mergeLocalAndServerWords(updatedWords, serverWords);

      const changedWords = findChangedWords(wordsList, mergedWords);

      if (changedWords.length > 0) {
        setWords(mergedWords);
        await saveWords(changedWords);
      }
    } catch (error) {
      console.log("Error syncing words:", error);
    }
  };

  const getUnsyncedWords = (words: Word[]): Word[] => {
    return words.filter(word => !word.synced);
  };

  const syncUnsyncedWords = async (unsyncedWords: Word[]): Promise<{ id: string, updatedAt: string }[]> => {
    if (unsyncedWords.length === 0) return [];
    const result = await syncWordsOnServer(unsyncedWords) as { id: string, updatedAt: string }[] | null;
    return result ?? [];
  };

  const updateLocalWords = (words: Word[], serverUpdates: { id: string, updatedAt: string }[]): Word[] => {
    const updatesMap = new Map(serverUpdates.map(update => [update.id, update.updatedAt]));
    return words.map(word => {
      if (updatesMap.has(word.id)) {
        const serverUpdatedAt = updatesMap.get(word.id) as string;
        return {
          ...word,
          synced: true,
          updatedAt: serverUpdatedAt,
          locallyUpdatedAt: serverUpdatedAt,
        };
      }
      return word;
    });
  };

  const findLatestUpdatedAt = (words: Word[]): string => {
    return new Date(
      Math.max(...words.map(word => new Date(word.updatedAt || word.locallyUpdatedAt).getTime()), 0)
    ).toISOString();
  };

  const fetchNewWords = async (updatedWords: Word[]): Promise<Word[]> => {
    const latestUpdatedAt = findLatestUpdatedAt(updatedWords);
    return await fetchUpdatedWords(latestUpdatedAt);
  };

  const mergeLocalAndServerWords = (localWords: Word[], serverWords: Word[]): Word[] => {
    const serverWordsMap = new Map(serverWords.map(sw => [sw.id, sw]));
    const existingIds = new Set(localWords.map(w => w.id));

    const mergedWords = localWords.map(word => {
      if (serverWordsMap.has(word.id)) {
        const serverWord = serverWordsMap.get(word.id)!;
        return {
          ...serverWord,
          synced: true,
          locallyUpdatedAt: serverWord.updatedAt,
          updatedAt: serverWord.updatedAt,
        };
      }
      return word;
    });

    const newWords = serverWords.filter(sw => !existingIds.has(sw.id)).map(sw => ({
      ...sw,
      synced: true,
      locallyUpdatedAt: sw.updatedAt,
      updatedAt: sw.updatedAt,
    }));

    return [...mergedWords, ...newWords];
  };

  const findChangedWords = (originalWords: Word[], finalWords: Word[]): Word[] => {
    const originalMap = new Map(originalWords.map(word => [word.id, word]));

    return finalWords.filter(word => {
      const original = originalMap.get(word.id);
      if (!original) return true;
      return (
        original.synced !== word.synced ||
        original.updatedAt !== word.updatedAt ||
        original.locallyUpdatedAt !== word.locallyUpdatedAt
      );
    });
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
      await createTables();
      await saveWordsFromAsyncStorage();
      await loadWords();
    } catch (error) {
      console.log('Error loading words from storage:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [languageContext.mainLangCode, languageContext.studyingLangCode]);

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