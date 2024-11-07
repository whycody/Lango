import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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

  useEffect(() => {
    const loadFlashcards = () => {
      try {
        const data = require('./data.json');
        const formattedData = data.map((item: { es: string; pl: string }) => ({
          word: item.es,
          translation: item.pl,
        }));
        setFlashcards(formattedData);
      } catch (error) {
        console.error("Błąd wczytywania fiszek: ", error);
      }
    };

    loadFlashcards();
  }, []);

  const getRandomFlashcard = () => {
    if (flashcards.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    return flashcards[randomIndex];
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
