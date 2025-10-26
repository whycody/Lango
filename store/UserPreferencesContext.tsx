import { createContext, FC, ReactNode, useContext } from "react";
import { SESSION_MODE } from "./types";
import { useUserStorage } from "./UserStorageContext";
import { useTypedMMKV } from "../hooks/useTypedMKKV";

export enum FLASHCARD_SIDE {
  WORD = 'WORD',
  TRANSLATION = 'TRANSLATION',
}

interface UserPreferencesContext {
  flashcardSide: FLASHCARD_SIDE;
  sessionMode: SESSION_MODE;
  sessionLength: 1 | 2 | 3;
  setFlashcardSide: (side: FLASHCARD_SIDE) => void;
  setSessionMode: (mode: SESSION_MODE) => void;
  setSessionLength: (length: 1 | 2 | 3) => void;
}

export const UserPreferencesContext = createContext<UserPreferencesContext>({
  flashcardSide: FLASHCARD_SIDE.WORD,
  sessionMode: SESSION_MODE.STUDY,
  sessionLength: 2,
  setFlashcardSide: () => {},
  setSessionMode: () => {},
  setSessionLength: () => {}
});

const FLASHCARD_SIDE_KEY = 'flashcardSide';
const SESSION_MODE_KEY = 'sessionMode';
const SESSION_LENGTH_KEY = 'sessionLength';

const UserPreferencesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { storage } = useUserStorage();
  const [flashcardSide, setFlashcardSide] = useTypedMMKV<FLASHCARD_SIDE>(FLASHCARD_SIDE_KEY, FLASHCARD_SIDE.WORD, storage);
  const [sessionMode, setSessionMode] = useTypedMMKV<SESSION_MODE>(SESSION_MODE_KEY, SESSION_MODE.STUDY, storage);
  const [sessionLength, setSessionLength] = useTypedMMKV<1 | 2 | 3>(SESSION_LENGTH_KEY, 2, storage);

  return (
    <UserPreferencesContext.Provider
      value={{ flashcardSide, sessionMode, sessionLength, setFlashcardSide, setSessionMode, setSessionLength }}
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

export default UserPreferencesProvider;