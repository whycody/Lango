import React, { createContext, FC, ReactNode, useContext, useEffect, useState, } from "react";
import { useWordsMLStatesContext } from "./WordsMLStatesContext";
import { WordWithDetails } from "./types";
import { useWordsWithDetailsRepository } from "../hooks/repo/useWordsWithDetailsRepository";
import { useLanguage } from "./LanguageContext";

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
  const { getAllWordsWithDetails } = useWordsWithDetailsRepository();
  const { mainLang, translationLang } = useLanguage();
  const { wordsMLStates } = useWordsMLStatesContext();
  const langWordsWithDetails = wordsWithDetails?.filter((word) =>
    word.mainLang === mainLang && word.translationLang === translationLang
  ) || [];

  const loadWordsMLStates = async () => {
    setLoading(true);
    try {
      const data = await getAllWordsWithDetails();
      setWordsWithDetails(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWordsMLStates();
  }, [wordsMLStates]);

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