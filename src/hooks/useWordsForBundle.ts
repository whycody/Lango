import { useMemo } from 'react';

import { useWordsBundle } from '../store/WordsBundleContext';
import { useWords } from '../store/WordsContext';
import { useWordsHeuristicStates } from '../store/WordsHeuristicStatesContext';
import { useWordsMLStatesContext } from '../store/WordsMLStatesContext';
import { useWordsWithDetails } from '../store/WordsWithDetailsContext';
import { Word, WordHeuristicState, WordMLState, WordWithDetails } from '../types';

export const MAIN_COLLECTION = 'main' as const;

type BundleScope = string | typeof MAIN_COLLECTION;

type WordsForBundle = {
    words: Word[];
    wordsHeuristicStates: WordHeuristicState[];
    wordsMLStates: WordMLState[];
    wordsWithDetails: WordWithDetails[];
};

export const useWordsForBundle = (scope: BundleScope): WordsForBundle => {
    const { langWords } = useWords();
    const { members } = useWordsBundle();
    const { langWordsMLStates } = useWordsMLStatesContext();
    const { langWordsHeuristicStates } = useWordsHeuristicStates();
    const { langWordsWithDetails } = useWordsWithDetails();

    const unsubscribedBundleIds = useMemo(
        () => new Set(members.filter(member => !member.subscribed).map(member => member.bundleId)),
        [members],
    );

    const matchesScope = useMemo(() => {
        if (scope === MAIN_COLLECTION) {
            return (word: { bundleId?: string }) =>
                !word.bundleId || !unsubscribedBundleIds.has(word.bundleId);
        }
        return (word: { bundleId?: string }) => word.bundleId === scope;
    }, [scope, unsubscribedBundleIds]);

    const words = useMemo(() => langWords.filter(matchesScope), [langWords, matchesScope]);

    const wordIdsSet = useMemo(() => new Set(words.map(word => word.id)), [words]);

    const wordsMLStates = useMemo(
        () => (langWordsMLStates ?? []).filter(state => wordIdsSet.has(state.wordId)),
        [langWordsMLStates, wordIdsSet],
    );

    const wordsHeuristicStates = useMemo(
        () => langWordsHeuristicStates.filter(state => wordIdsSet.has(state.wordId)),
        [langWordsHeuristicStates, wordIdsSet],
    );

    const wordsWithDetails = useMemo(
        () => langWordsWithDetails.filter(word => wordIdsSet.has(word.id)),
        [langWordsWithDetails, wordIdsSet],
    );

    return { words, wordsHeuristicStates, wordsMLStates, wordsWithDetails };
};
