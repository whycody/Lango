import React, { createContext, FC, useContext, useEffect, useState, } from "react";
import { useWordDetails } from "./WordsDetailsContext";
import { WordWithDetails } from "./types";
import { useWordsWithDetailsRepository } from "../hooks/repo/useWordsWithDetailsRepository";

interface WordsWithDetailsContextProps {
  loading: boolean;
  wordsWithDetails: WordWithDetails[] | null;
}

export const WordsWithDetailsContext = createContext<WordsWithDetailsContextProps>({
  loading: false,
  wordsWithDetails: null,
});

const WordsWithDetailsProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wordsWithDetails, setWordsWithDetails] = useState<WordWithDetails[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { getAllWordsWithDetails } = useWordsWithDetailsRepository();
  const { wordsDetails } = useWordDetails();

  const loadWordsWithDetails = async () => {
    setLoading(true);
    try {
      const data = await getAllWordsWithDetails();
      setWordsWithDetails(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWordsWithDetails();
  }, [wordsDetails]);

  return (
    <WordsWithDetailsContext.Provider value={{ loading, wordsWithDetails }}>
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