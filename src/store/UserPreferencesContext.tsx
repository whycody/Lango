import { createContext, FC, ReactNode, useContext } from "react";
import { SessionMode } from "../types";
import { useUserStorage } from "./UserStorageContext";
import { useTypedMMKV } from "../hooks/useTypedMKKV";

export enum FlashcardSide {
  WORD = 'WORD',
  TRANSLATION = 'TRANSLATION',
}

export enum SessionLength {
  SHORT = 1,
  MEDIUM = 2,
  LONG = 3,
}

interface UserPreferencesContext {
  flashcardSide: FlashcardSide;
  sessionMode: SessionMode;
  sessionLength: SessionLength;
  sessionSpeechSynthesizer: boolean;
  vibrationsEnabled: boolean;
  askLaterNotifications: number | null;
  setFlashcardSide: (side: FlashcardSide) => void;
  setSessionMode: (mode: SessionMode) => void;
  setSessionLength: (length: SessionLength) => void;
  setSessionSpeechSynthesizer: (sessionSpeechSynthesizer: boolean) => void;
  setVibrationsEnabled: (enabled: boolean) => void;
  setAskLaterNotifications: (timestamp: number) => void;
}

export const UserPreferencesContext = createContext<UserPreferencesContext>({
  flashcardSide: FlashcardSide.WORD,
  sessionMode: SessionMode.STUDY,
  sessionLength: 2,
  sessionSpeechSynthesizer: true,
  vibrationsEnabled: true,
  askLaterNotifications: null,
  setFlashcardSide: () => {},
  setSessionMode: () => {},
  setSessionLength: () => {},
  setSessionSpeechSynthesizer: () => {},
  setVibrationsEnabled: () => {},
  setAskLaterNotifications: () => {},
});

const FLASHCARD_SIDE_KEY = 'flashcardSide';
const SESSION_MODE_KEY = 'sessionMode';
const SESSION_LENGTH_KEY = 'sessionLength';
const SESSION_SPEECH_SYNTHESIZER_KEY = 'sessionSpeechSynthesizer';
const VIBRATIONS_KEY = 'vibrationsEnabled';
const ASK_LATER_NOTIFICATIONS_KEY = 'askLaterNotifications';

const UserPreferencesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { storage } = useUserStorage();
  const [flashcardSide, setFlashcardSide] = useTypedMMKV<FlashcardSide>(FLASHCARD_SIDE_KEY, FlashcardSide.WORD, storage);
  const [sessionMode, setSessionMode] = useTypedMMKV<SessionMode>(SESSION_MODE_KEY, SessionMode.STUDY, storage);
  const [sessionLength, setSessionLength] = useTypedMMKV<SessionLength>(SESSION_LENGTH_KEY, SessionLength.MEDIUM, storage);
  const [sessionSpeechSynthesizer, setSessionSpeechSynthesizer] = useTypedMMKV(SESSION_SPEECH_SYNTHESIZER_KEY, true, storage);
  const [vibrationsEnabled, setVibrationsEnabled] = useTypedMMKV(VIBRATIONS_KEY, true, storage);
  const [askLaterNotifications, setAskLaterNotifications] = useTypedMMKV<number>(ASK_LATER_NOTIFICATIONS_KEY, 0, storage);

  return (
    <UserPreferencesContext.Provider
      value={{
        flashcardSide,
        sessionMode,
        sessionLength,
        sessionSpeechSynthesizer,
        vibrationsEnabled,
        askLaterNotifications,
        setFlashcardSide,
        setSessionMode,
        setSessionLength,
        setSessionSpeechSynthesizer,
        setVibrationsEnabled,
        setAskLaterNotifications,
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

export default UserPreferencesProvider;