import { createContext, FC, ReactNode, useContext } from "react";
import { SessionMode } from "../types";
import { useUserStorage } from "./UserStorageContext";
import { useTypedMMKV } from "../hooks/useTypedMKKV";
import { PermissionStatus } from "expo-notifications";

export enum FlashcardSide {
  WORD = 'WORD',
  TRANSLATION = 'TRANSLATION',
}

export enum SessionLength {
  SHORT = 1,
  MEDIUM = 2,
  LONG = 3,
}

export enum FlashcardSortingMethod {
  ADD_DATE_ASC,
  ADD_DATE_DESC,
  GRADE_THREE_PROB_ASC,
  GRADE_THREE_PROB_DESC,
  REPETITIONS_COUNT_ASC,
  REPETITIONS_COUNT_DESC,
}

interface UserPreferencesContext {
  flashcardSide: FlashcardSide;
  sessionMode: SessionMode;
  sessionLength: SessionLength;
  sessionSpeechSynthesizer: boolean;
  vibrationsEnabled: boolean;
  askLaterNotifications: number | null;
  flashcardsSortingMethod: FlashcardSortingMethod;
  userHasEverHitFlashcard: boolean;
  notificationsPermissionStatus: PermissionStatus;
  setFlashcardSide: (side: FlashcardSide) => void;
  setSessionMode: (mode: SessionMode) => void;
  setSessionLength: (length: SessionLength) => void;
  setSessionSpeechSynthesizer: (sessionSpeechSynthesizer: boolean) => void;
  setVibrationsEnabled: (enabled: boolean) => void;
  setAskLaterNotifications: (timestamp: number) => void;
  setFlashcardsSortingMethod: (method: FlashcardSortingMethod) => void;
  setUserHasEverHitFlashcard: (hasEverHit: boolean) => void;
  setNotificationsPermissionStatus: (status: PermissionStatus) => void;
}

export const UserPreferencesContext = createContext<UserPreferencesContext>({
  flashcardSide: FlashcardSide.WORD,
  sessionMode: SessionMode.STUDY,
  sessionLength: 2,
  sessionSpeechSynthesizer: true,
  vibrationsEnabled: true,
  askLaterNotifications: null,
  flashcardsSortingMethod: FlashcardSortingMethod.ADD_DATE_DESC,
  userHasEverHitFlashcard: false,
  notificationsPermissionStatus: PermissionStatus.UNDETERMINED,
  setFlashcardSide: () => {},
  setSessionMode: () => {},
  setSessionLength: () => {},
  setSessionSpeechSynthesizer: () => {},
  setVibrationsEnabled: () => {},
  setAskLaterNotifications: () => {},
  setFlashcardsSortingMethod: () => {},
  setUserHasEverHitFlashcard: () => {},
  setNotificationsPermissionStatus: () => {},
});

const FLASHCARD_SIDE_KEY = 'flashcardSide';
const SESSION_MODE_KEY = 'sessionMode';
const SESSION_LENGTH_KEY = 'sessionLength';
const SESSION_SPEECH_SYNTHESIZER_KEY = 'sessionSpeechSynthesizer';
const VIBRATIONS_KEY = 'vibrationsEnabled';
const ASK_LATER_NOTIFICATIONS_KEY = 'askLaterNotifications';
const FLASHCARDS_SORTING_METHOD = 'flashcardsSortingMethod';
const USER_HAS_EVER_HIT_FLASHCARD = 'userHasEverHitFlashcard';
const NOTIFICATION_PERMISSION_STATUS = 'lastUserNotificationPermissionStatus';

const UserPreferencesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { storage } = useUserStorage();
  const [flashcardSide, setFlashcardSide] = useTypedMMKV<FlashcardSide>(FLASHCARD_SIDE_KEY, FlashcardSide.WORD, storage);
  const [sessionMode, setSessionMode] = useTypedMMKV<SessionMode>(SESSION_MODE_KEY, SessionMode.STUDY, storage);
  const [sessionLength, setSessionLength] = useTypedMMKV<SessionLength>(SESSION_LENGTH_KEY, SessionLength.MEDIUM, storage);
  const [sessionSpeechSynthesizer, setSessionSpeechSynthesizer] = useTypedMMKV(SESSION_SPEECH_SYNTHESIZER_KEY, true, storage);
  const [vibrationsEnabled, setVibrationsEnabled] = useTypedMMKV(VIBRATIONS_KEY, true, storage);
  const [askLaterNotifications, setAskLaterNotifications] = useTypedMMKV<number>(ASK_LATER_NOTIFICATIONS_KEY, 0, storage);
  const [flashcardsSortingMethod, setFlashcardsSortingMethod] = useTypedMMKV<FlashcardSortingMethod>(FLASHCARDS_SORTING_METHOD,
    FlashcardSortingMethod.ADD_DATE_DESC, storage)
  const [userHasEverHitFlashcard, setUserHasEverHitFlashcard] = useTypedMMKV(USER_HAS_EVER_HIT_FLASHCARD, false, storage);
  const [notificationsPermissionStatus, setNotificationsPermissionStatus] =
    useTypedMMKV<PermissionStatus>(NOTIFICATION_PERMISSION_STATUS, PermissionStatus.UNDETERMINED, storage);

  return (
    <UserPreferencesContext.Provider
      value={{
        flashcardSide,
        sessionMode,
        sessionLength,
        sessionSpeechSynthesizer,
        vibrationsEnabled,
        askLaterNotifications,
        flashcardsSortingMethod,
        userHasEverHitFlashcard,
        notificationsPermissionStatus,
        setFlashcardSide,
        setSessionMode,
        setSessionLength,
        setSessionSpeechSynthesizer,
        setVibrationsEnabled,
        setAskLaterNotifications,
        setFlashcardsSortingMethod,
        setUserHasEverHitFlashcard,
        setNotificationsPermissionStatus,
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