import React, {
    createContext,
    FC,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { ObjectId } from 'bson';

import { wordsApi } from '../api/words-api';
import { WordSource } from '../constants/Word';
import { useWordsRepository } from '../hooks/repo';
import { Word } from '../types';
import { getCurrentISO } from '../utils/dateUtil';
import {
    applyUnauthorizedItems,
    findChangedItems,
    findLatestUpdatedAt,
    getUnsyncedItems,
    mergeLocalAndServer,
    syncInBatches,
    updateLocalItems,
} from '../utils/sync';
import { useAppInitializer } from './AppInitializerContext';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { useWordsBundle } from './WordsBundleContext';

const EPOCH_ISO = '1970-01-01T00:00:00.000Z';

interface WordsContextProps {
    addFetchedWords: (fetchedWords: Word[]) => Promise<void>;
    addWord: (
        text: string,
        translation: string,
        source: WordSource,
        bundleId?: string,
    ) => Word | null;
    addWords: (wordsToAdd: { text: string; translation: string }[], source: WordSource) => Word[];
    editWord: (updatedWord: Partial<Word> & { id: string }) => void;
    getWord: (id: string) => Word | undefined;
    langWords: Word[];
    loading: boolean;
    removeWord: (id: string) => void;
    syncWords: () => Promise<void>;
    words: Word[];
}

const WordsContext = createContext<WordsContextProps>({
    addFetchedWords: () => Promise.resolve(),
    addWord: () => null,
    addWords: () => [],
    editWord: () => [],
    getWord: () => undefined,
    langWords: [],
    loading: true,
    removeWord: () => [],
    syncWords: () => Promise.resolve(),
    words: [],
});

export const WordsProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { initialLoad } = useAppInitializer();
    const [loading, setLoading] = useState(false);
    const [words, setWords] = useState<Word[]>(initialLoad!.words);
    const { mainLang, translationLang } = useLanguage();
    const { deleteWordsByBundleId, deleteWordsByIds, getAllWords, saveWords, updateWord } =
        useWordsRepository();
    const { bundles, members, setWordsBackfilled } = useWordsBundle();
    const { user } = useAuth();
    const syncing = useRef(false);
    const syncingBundleWords = useRef(new Set<string>());
    const removingBundleWords = useRef(new Set<string>());

    const langWords = useMemo(
        () =>
            words.filter(
                word =>
                    !word.removed &&
                    word.mainLang == mainLang &&
                    word.translationLang == translationLang,
            ),
        [words, mainLang, translationLang],
    );

    const createWord = (
        text: string,
        translation: string,
        source: WordSource,
        bundleId?: string,
    ): Word => {
        const now = getCurrentISO();
        return {
            active: true,
            addDate: now,
            bundleId,
            id: new ObjectId().toHexString(),
            locallyUpdatedAt: now,
            mainLang,
            removed: false,
            source,
            synced: false,
            text,
            translation,
            translationLang,
            updatedAt: undefined,
        };
    };

    const findExistingWord = (
        text: string,
        translation: string,
        bundleId?: string,
    ): Word | undefined =>
        words.find(w => w.text === text && w.translation === translation && w.bundleId == bundleId);

    const reviveWord = (word: Word): Word => {
        editWord({ id: word.id, removed: false });
        return { ...word, removed: false };
    };

    const addWord = (
        text: string,
        translation: string,
        source: WordSource,
        bundleId?: string,
    ): Word | null => {
        const existing = findExistingWord(text, translation, bundleId);

        if (existing) return existing.removed ? reviveWord(existing) : null;

        const newWord = createWord(text, translation, source, bundleId);
        const updatedWords = [newWord, ...words];

        setWords(updatedWords);
        syncWords(updatedWords);
        saveWords([newWord]);

        return newWord;
    };

    const addWords = (
        wordsToAdd: { text: string; translation: string }[],
        source: WordSource,
    ): Word[] => {
        const map = new Map(words.map(w => [`${w.text}__${w.translation}`, w]));
        const now = getCurrentISO();

        const result: Word[] = [];

        for (const { text, translation } of wordsToAdd) {
            const key = `${text}__${translation}`;
            const existing = map.get(key);

            if (existing) {
                result.push(
                    existing.removed
                        ? {
                              ...existing,
                              locallyUpdatedAt: now,
                              removed: false,
                              synced: false,
                          }
                        : existing,
                );
                continue;
            }

            const newWord = createWord(text, translation, source);
            map.set(key, newWord);
            result.push(newWord);
        }

        const resultIds = new Set(result.map(r => r.id));
        const updatedWords = [...result, ...words.filter(w => !resultIds.has(w.id))];

        setWords(updatedWords);
        syncWords(updatedWords);
        saveWords(result);

        return result;
    };

    const getWord = (id: string): Word | undefined => words.find(word => word.id === id);

    const addFetchedWords = async (fetchedWords: Word[]) => {
        const mergedWords = mergeLocalAndServer<Word>(words, fetchedWords);
        const changedWords = findChangedItems<Word>(words, mergedWords);

        if (changedWords.length === 0) return;

        setWords(mergedWords);
        await saveWords(changedWords);
    };

    const editWord = (updatedWord: Partial<Word> & { id: string }) => {
        const updatedAt = getCurrentISO();

        const updatedWords = words.map(word =>
            word.id === updatedWord.id
                ? {
                      ...word,
                      ...updatedWord,
                      locallyUpdatedAt: updatedAt,
                      synced: false,
                  }
                : word,
        );

        const changed = updatedWords.find(w => w.id === updatedWord.id)!;

        setWords(updatedWords);
        syncWords(updatedWords);
        updateWord(changed);
    };

    const removeWord = (id: string) => {
        const updatedWords = words.map(word => {
            if (word.id === id) {
                return {
                    ...word,
                    locallyUpdatedAt: getCurrentISO(),
                    removed: true,
                    synced: false,
                };
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
            const { rejectedIds, synced, unauthorized } = await syncInBatches<Word>(
                unsyncedWords,
                words => wordsApi.syncWordsOnServer(words),
            );

            const rejectedIdsSet = new Set(rejectedIds);
            const remainingWords = wordsList.filter(word => !rejectedIdsSet.has(word.id));

            const updatedWords = updateLocalItems<Word>(remainingWords, synced);
            const withUnauthorizedApplied = applyUnauthorizedItems<Word>(
                updatedWords,
                unauthorized,
            );
            const serverWords = await fetchNewWords(withUnauthorizedApplied);
            const mergedWords = mergeLocalAndServer<Word>(withUnauthorizedApplied, serverWords);
            const changedWords = findChangedItems<Word>(wordsList, mergedWords);

            if (rejectedIds.length > 0) {
                await deleteWordsByIds(rejectedIds);
            }

            if (changedWords.length > 0 || rejectedIds.length > 0) {
                setWords(mergedWords);
            }

            if (changedWords.length > 0) {
                await saveWords(changedWords);
            }
        } catch (error) {
            console.log('Error syncing words:', error);
        } finally {
            syncing.current = false;
        }
    };

    const fetchNewWords = async (updatedWords: Word[]): Promise<Word[]> => {
        const latestUpdatedAt = findLatestUpdatedAt<Word>(updatedWords);
        const result = await wordsApi.fetchUpdatedWords(latestUpdatedAt);
        return result.kind === 'ok' ? result.data : [];
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
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const localBundleIds = new Set(
            words.map(word => word.bundleId).filter((bundleId): bundleId is string => !!bundleId),
        );

        const bundleIdsToRemove = members
            .filter(
                member =>
                    member.removed &&
                    localBundleIds.has(member.bundleId) &&
                    !removingBundleWords.current.has(member.bundleId),
            )
            .map(member => member.bundleId);

        if (bundleIdsToRemove.length === 0) return;

        bundleIdsToRemove.forEach(bundleId => removingBundleWords.current.add(bundleId));

        const deleteRemovedBundlesWords = async () => {
            try {
                for (const bundleId of bundleIdsToRemove) {
                    await deleteWordsByBundleId(bundleId);
                }

                const wordsList = await getAllWords();
                setWords(wordsList);
            } catch (error) {
                console.log('Error deleting words of removed bundles:', error);
            } finally {
                bundleIdsToRemove.forEach(bundleId => removingBundleWords.current.delete(bundleId));
            }
        };

        deleteRemovedBundlesWords();
    }, [members, words]);

    useEffect(() => {
        const pendingBundles = bundles.filter(
            bundle => !bundle.wordsBackfilled && !syncingBundleWords.current.has(bundle.id),
        );

        if (pendingBundles.length === 0) return;

        pendingBundles.forEach(bundle => syncingBundleWords.current.add(bundle.id));

        const fetchBundleWords = async (bundleId: string): Promise<Word[]> => {
            const bundleWords = words.filter(word => word.bundleId === bundleId);
            const since =
                bundleWords.length > 0 ? findLatestUpdatedAt<Word>(bundleWords) : EPOCH_ISO;

            const result = await wordsApi.fetchUpdatedWords(since, bundleId);
            return result.kind === 'ok' ? result.data : [];
        };

        const syncBundlesWords = async () => {
            try {
                const serverWordsPerBundle = await Promise.all(
                    pendingBundles.map(bundle => fetchBundleWords(bundle.id)),
                );
                const serverWords = serverWordsPerBundle.flat();

                const wordsList = await getAllWords();
                const mergedWords = mergeLocalAndServer<Word>(wordsList, serverWords);
                const changedWords = findChangedItems<Word>(wordsList, mergedWords);

                setWords(mergedWords);
                if (changedWords.length > 0) {
                    await saveWords(changedWords);
                }

                pendingBundles.forEach(bundle => setWordsBackfilled(bundle.id, true));
            } catch (error) {
                console.log('Error syncing bundle words:', error);
            } finally {
                pendingBundles.forEach(bundle => syncingBundleWords.current.delete(bundle.id));
            }
        };

        syncBundlesWords();
    }, [bundles, words]);

    return (
        <WordsContext.Provider
            value={{
                addFetchedWords,
                addWord,
                addWords,
                editWord,
                getWord,
                langWords,
                loading,
                removeWord,
                syncWords,
                words,
            }}
        >
            {children}
        </WordsContext.Provider>
    );
};

export const useWords = (): WordsContextProps => {
    const context = useContext(WordsContext);
    if (!context) {
        throw new Error('useWords must be used within a WordsProvider');
    }
    return context;
};
