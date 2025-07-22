import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWords } from "./WordsContext";
import { useLanguage } from "../hooks/useLanguage";
import { LanguageCode, Word } from "./types";

export interface FlashcardContent {
  word: string;
  translation: string;
}

interface FlashcardContextType {
  flashcards: FlashcardContent[];
  getRandomFlashcard: () => FlashcardContent | null;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

interface FlashcardProviderProps {
  children: ReactNode;
}

export const FlashcardProvider: React.FC<FlashcardProviderProps> = ({ children }) => {
  const [flashcards, setFlashcards] = useState<FlashcardContent[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const languageContext = useLanguage();

  const wordsContext = useWords();

  useEffect(() => {
    setWords(words);
  }, [wordsContext.words]);

  useEffect(() => {
    const loadFlashcards = () => {
      try {
        const data =
          languageContext.studyingLangCode == LanguageCode.ENGLISH ? require('./data/en.json') :
          languageContext.studyingLangCode == LanguageCode.SPANISH ? require('./data/es.json') :
            require('./data/it.json');
        const formattedData = data.map((item: any) => ({
          word: item[languageContext.studyingLangCode],
          translation: item.pl,
        }));
        setFlashcards(formattedData);
      } catch (error) {
        console.error("Błąd wczytywania fiszek: ", error);
      }
    };

    loadFlashcards();
  }, [languageContext.studyingLangCode]);

  const getRandomFlashcard = () => {
    if (flashcards.length === 0) return null;
    const filteredFlashcards = flashcards.filter((flashcard) => !words.some((word: Word) => word.text == flashcard.word));
    const randomIndex = Math.floor(Math.random() * filteredFlashcards.length);
    return filteredFlashcards[randomIndex];
  };

  return (
    <FlashcardContext.Provider value={{ flashcards, getRandomFlashcard }}>
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};
