import React, { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react';

import { WordMLState, WordWithDetails } from '../types';
import { useLanguage } from './LanguageContext';
import { useWords } from './WordsContext';
import { useWordsMLStatesContext } from './WordsMLStatesContext';

interface WordsWithDetailsContextProps {
    langWordsWithDetails: WordWithDetails[];
    wordsWithDetails: WordWithDetails[] | null;
}

export const WordsWithDetailsContext = createContext<WordsWithDetailsContextProps>({
    langWordsWithDetails: [],
    wordsWithDetails: [],
});

export const WordsWithDetailsProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [wordsWithDetails, setWordsWithDetails] = useState<WordWithDetails[] | null>(null);
    const { mainLang, translationLang } = useLanguage();
    const { wordsMLStates } = useWordsMLStatesContext();
    const { langWords } = useWords();
    const langWordsWithDetails =
        wordsWithDetails?.filter(
            word => word.mainLang === mainLang && word.translationLang === translationLang,
        ) || [];

    const loadData = () => {
        const statesByWordId: Record<string, WordMLState> = {};
        for (const s of wordsMLStates) {
            statesByWordId[s.wordId] = s;
        }

        setWordsWithDetails(
            langWords.map(w => {
                const state: WordMLState = statesByWordId[w.id];
                return { ...w, ...state } satisfies WordWithDetails;
            }),
        );
    };

    useEffect(() => {
        loadData();
    }, [wordsMLStates, langWords]);

    return (
        <WordsWithDetailsContext.Provider value={{ langWordsWithDetails, wordsWithDetails }}>
            {children}
        </WordsWithDetailsContext.Provider>
    );
};

export const useWordsWithDetails = (): WordsWithDetailsContextProps => {
    const context = useContext(WordsWithDetailsContext);
    if (!context) {
        throw new Error('useWordsWithDetails must be used within a WordsWithDetailsProvider');
    }
    return context;
};
