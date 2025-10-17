import React, { createContext, FC, ReactNode, useContext, useEffect, useState, } from "react";
import { useWordsMLStatesContext } from "./WordsMLStatesContext";
import { WordMLState, WordWithDetails } from "./types";
import { useLanguage } from "./LanguageContext";
import { useWords } from "./WordsContext";

interface WordsWithDetailsContextProps {
  loading: boolean;
  wordsWithDetails: WordWithDetails[];
  langWordsWithDetails: WordWithDetails[];
}

export const WordsWithDetailsContext = createContext<WordsWithDetailsContextProps>({
  loading: false,
  wordsWithDetails: [],
  langWordsWithDetails: [],
});

const WordsWithDetailsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [wordsWithDetails, setWordsWithDetails] = useState<WordWithDetails[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { mainLang, translationLang } = useLanguage();
  const { wordsMLStates } = useWordsMLStatesContext();
  const { langWords } = useWords();
  const langWordsWithDetails = wordsWithDetails?.filter((word) =>
    word.mainLang === mainLang && word.translationLang === translationLang
  ) || [];

  const loadData = () => {
    const statesByWordId: Record<string, WordMLState> = {};
    for (const s of wordsMLStates) {
      statesByWordId[s.wordId] = s;
    }

    setWordsWithDetails(
      langWords
        .map(w => {
            const state = statesByWordId[w.id];
            return { ...w, ...state, } satisfies WordWithDetails;
          }
        ));
  }

  useEffect(() => {
    loadData();
  }, [wordsMLStates, langWords]);

  return (
    <WordsWithDetailsContext.Provider value={{ loading, wordsWithDetails, langWordsWithDetails }}>
      {children}
    </WordsWithDetailsContext.Provider>
  );
};

export const useWordsWithDetails = (): WordsWithDetailsContextProps => {
  const context = useContext(WordsWithDetailsContext);
  if (!context) {
    throw new Error("useWordsWithDetails must be used within a WordsWithDetailsProvider");
  }
  return context;
};

export default WordsWithDetailsProvider;