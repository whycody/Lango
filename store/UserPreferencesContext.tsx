import { createContext, FC, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum SESSION_MODE {
  STUDY = 'STUDY',
  RANDOM = 'RANDOM',
  OLDEST = 'OLDEST'
}

export enum FLASHCARD_SIDE {
  WORD = 'WORD',
  TRANSLATION = 'TRANSLATION',
}

interface UserPreferencesContext {
  flashcardSide: FLASHCARD_SIDE;
  sessionMode: SESSION_MODE;
  sessionLength: 1 | 2 | 3;
  setFlashcardSide: (side: FLASHCARD_SIDE) => Promise<void>;
  setSessionMode: (mode: SESSION_MODE) => Promise<void>;
  setSessionLength: (length: 1 | 2 | 3) => Promise<void>;
}

export const UserPreferencesContext = createContext<UserPreferencesContext>({
  flashcardSide: FLASHCARD_SIDE.WORD,
  sessionMode: SESSION_MODE.STUDY,
  sessionLength: 2,
  setFlashcardSide: () => Promise.resolve(),
  setSessionMode: () => Promise.resolve(),
  setSessionLength: () => Promise.resolve()
});

const FLASHCARD_SIDE_KEY = 'flashcardSide';
const SESSION_MODE_KEY = 'sessionMode';
const SESSION_LENGTH_KEY = 'sessionLength';

export const UserPreferencesProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentFlashcardSide, setCurrentFlashcardSide] = useState(FLASHCARD_SIDE.WORD);
  const [currentSessionMode, setCurrentSessionMode] = useState(SESSION_MODE.STUDY);
  const [currentSessionLength, setCurrentSessionLength] = useState<1 | 2 | 3>(2);

  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const flashcardSide = await AsyncStorage.getItem(FLASHCARD_SIDE_KEY);
        const sessionMode = await AsyncStorage.getItem(SESSION_MODE_KEY);
        const sessionLength = await AsyncStorage.getItem(SESSION_LENGTH_KEY);

        if (flashcardSide) {
          setCurrentFlashcardSide(flashcardSide as FLASHCARD_SIDE);
        }

        if (sessionMode) {
          setCurrentSessionMode(sessionMode as SESSION_MODE);
        }

        if (sessionLength) {
          const length = Number(sessionLength);
          if (length === 1 || length === 2 || length === 3) {
            setCurrentSessionLength(length);
          }
        }
      } catch (error) {
        console.error("Failed to load statistics from AsyncStorage", error);
      }
    };

    loadUserPreferences();
  }, []);

  const setFlashcardSide = async (side: FLASHCARD_SIDE) => {
    setCurrentFlashcardSide(side);
    await AsyncStorage.setItem(FLASHCARD_SIDE_KEY, side);
  };

  const setSessionMode = async (mode: SESSION_MODE) => {
    setCurrentSessionMode(mode);
    await AsyncStorage.setItem(SESSION_MODE_KEY, mode);
  };

  const setSessionLength = async (length: 1 | 2 | 3) => {
    setCurrentSessionLength(length);
    await AsyncStorage.setItem(SESSION_LENGTH_KEY, String(length));
  }

  return (
    <UserPreferencesContext.Provider
      value={{
        flashcardSide: currentFlashcardSide,
        sessionMode: currentSessionMode,
        sessionLength: currentSessionLength,
        setFlashcardSide,
        setSessionMode,
        setSessionLength
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
};