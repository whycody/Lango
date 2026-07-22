import { createContext, FC, ReactNode, useContext, useState } from 'react';
import { PermissionStatus } from 'expo-notifications';
import { useMMKV } from 'react-native-mmkv';

import { SessionMode } from '../constants/Session';
import {
    AppTheme,
    FlashcardSide,
    FlashcardSortingMethod,
    SessionLength,
} from '../constants/UserPreferences';
import { useTypedMMKV } from '../hooks/useTypedMKKV';
import { useUserStorage } from './UserStorageContext';

interface UserPreferencesContextProps {
    appTheme: AppTheme;
    askLaterNotifications: number | null;
    askedNotificationsThisSession: boolean;
    flashcardSide: FlashcardSide;
    flashcardsSortingMethod: FlashcardSortingMethod;
    notificationsPermissionStatus: PermissionStatus;
    sessionLength: SessionLength;
    sessionMode: SessionMode;
    sessionSpeechSynthesizer: boolean;
    setAppTheme: (theme: AppTheme) => void;
    setAskLaterNotifications: (timestamp: number) => void;
    setFlashcardSide: (side: FlashcardSide) => void;
    setFlashcardsSortingMethod: (method: FlashcardSortingMethod) => void;
    setNotificationsPermissionStatus: (status: PermissionStatus) => void;
    setSessionLength: (length: SessionLength) => void;
    setSessionMode: (mode: SessionMode) => void;
    setSessionSpeechSynthesizer: (sessionSpeechSynthesizer: boolean) => void;
    setUserHasEverHitFlashcard: (hasEverHit: boolean) => void;
    setUserHasEverSkippedSuggestion: (hasEverSkip: boolean) => void;
    setUserHasEverSeenSuggestionInSession: (hasEverSeen: boolean) => void;
    setVibrationsEnabled: (enabled: boolean) => void;
    setSoundEffectsEnabled: (enabled: boolean) => void;
    setAskedNotificationsThisSession: (asked: boolean) => void;
    userHasEverHitFlashcard: boolean;
    userHasEverSkippedSuggestion: boolean;
    userHasEverSeenSuggestionInSession: boolean;
    vibrationsEnabled: boolean;
    soundEffectsEnabled: boolean;
}

export const UserPreferencesContext = createContext<UserPreferencesContextProps>({
    appTheme: AppTheme.BLUE,
    askedNotificationsThisSession: false,
    askLaterNotifications: null,
    flashcardSide: FlashcardSide.WORD,
    flashcardsSortingMethod: FlashcardSortingMethod.ADD_DATE_DESC,
    notificationsPermissionStatus: PermissionStatus.UNDETERMINED,
    sessionLength: 2,
    sessionMode: SessionMode.STUDY,
    sessionSpeechSynthesizer: true,
    setAppTheme: () => {},
    setAskedNotificationsThisSession: () => {},
    setAskLaterNotifications: () => {},
    setFlashcardSide: () => {},
    setFlashcardsSortingMethod: () => {},
    setNotificationsPermissionStatus: () => {},
    setSessionLength: () => {},
    setSessionMode: () => {},
    setSessionSpeechSynthesizer: () => {},
    setSoundEffectsEnabled: () => {},
    setUserHasEverHitFlashcard: () => {},
    setUserHasEverSeenSuggestionInSession: () => {},
    setUserHasEverSkippedSuggestion: () => {},
    setVibrationsEnabled: () => {},
    soundEffectsEnabled: true,
    userHasEverHitFlashcard: false,
    userHasEverSeenSuggestionInSession: false,
    userHasEverSkippedSuggestion: false,
    vibrationsEnabled: true,
});

const APP_THEME_KEY = 'appTheme';
const FLASHCARD_SIDE_KEY = 'flashcardSide';
const SESSION_MODE_KEY = 'sessionMode';
const SESSION_LENGTH_KEY = 'sessionLength';
const SESSION_SPEECH_SYNTHESIZER_KEY = 'sessionSpeechSynthesizer';
const VIBRATIONS_KEY = 'vibrationsEnabled';
const SOUND_EFFECTS_KEY = 'soundEffectsEnabled';
const ASK_LATER_NOTIFICATIONS_KEY = 'askLaterNotifications';
const FLASHCARDS_SORTING_METHOD = 'flashcardsSortingMethod';
const USER_HAS_EVER_HIT_FLASHCARD = 'userHasEverHitFlashcard';
const USER_HAS_SKIPPED_SUGGESTION = 'userHasEverSkippedSuggestion';
const USER_HAS_EVER_SEEN_SUGGESTION_IN_SESSION = 'userHasEverSeenSuggestionInSession';
const NOTIFICATION_PERMISSION_STATUS = 'lastUserNotificationPermissionStatus';

export const UserPreferencesProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const userStorage = useUserStorage();
    const defaultStorage = useMMKV({ id: 'user-storage' });
    const storage = userStorage.storage ?? defaultStorage;
    const [askedNotificationsThisSession, setAskedNotificationsThisSession] = useState(false);
    const [appTheme, setAppThemeInStorage] = useTypedMMKV<AppTheme>(
        APP_THEME_KEY,
        AppTheme.BLUE,
        storage,
    );
    const setAppTheme = (theme: AppTheme) => {
        setAppThemeInStorage(theme);
        defaultStorage.set(APP_THEME_KEY, theme);
    };
    const [flashcardSide, setFlashcardSide] = useTypedMMKV<FlashcardSide>(
        FLASHCARD_SIDE_KEY,
        FlashcardSide.WORD,
        storage,
    );
    const [sessionMode, setSessionMode] = useTypedMMKV<SessionMode>(
        SESSION_MODE_KEY,
        SessionMode.STUDY,
        storage,
    );
    const [sessionLength, setSessionLength] = useTypedMMKV<SessionLength>(
        SESSION_LENGTH_KEY,
        SessionLength.SHORT,
        storage,
    );
    const [sessionSpeechSynthesizer, setSessionSpeechSynthesizer] = useTypedMMKV<boolean>(
        SESSION_SPEECH_SYNTHESIZER_KEY,
        true,
        storage,
    );
    const [vibrationsEnabled, setVibrationsEnabled] = useTypedMMKV<boolean>(
        VIBRATIONS_KEY,
        true,
        storage,
    );
    const [soundEffectsEnabled, setSoundEffectsEnabled] = useTypedMMKV<boolean>(
        SOUND_EFFECTS_KEY,
        true,
        storage,
    );
    const [askLaterNotifications, setAskLaterNotifications] = useTypedMMKV<number>(
        ASK_LATER_NOTIFICATIONS_KEY,
        0,
        defaultStorage,
    );
    const [flashcardsSortingMethod, setFlashcardsSortingMethod] =
        useTypedMMKV<FlashcardSortingMethod>(
            FLASHCARDS_SORTING_METHOD,
            FlashcardSortingMethod.ADD_DATE_DESC,
            storage,
        );
    const [userHasEverHitFlashcard, setUserHasEverHitFlashcard] = useTypedMMKV<boolean>(
        USER_HAS_EVER_HIT_FLASHCARD,
        false,
        storage,
    );
    const [userHasEverSkippedSuggestion, setUserHasEverSkippedSuggestion] = useTypedMMKV<boolean>(
        USER_HAS_SKIPPED_SUGGESTION,
        false,
        storage,
    );
    const [userHasEverSeenSuggestionInSession, setUserHasEverSeenSuggestionInSession] =
        useTypedMMKV<boolean>(USER_HAS_EVER_SEEN_SUGGESTION_IN_SESSION, false, storage);
    const [notificationsPermissionStatus, setNotificationsPermissionStatus] =
        useTypedMMKV<PermissionStatus>(
            NOTIFICATION_PERMISSION_STATUS,
            PermissionStatus.UNDETERMINED,
            storage,
        );

    return (
        <UserPreferencesContext.Provider
            value={{
                appTheme,
                askedNotificationsThisSession,
                askLaterNotifications,
                flashcardSide,
                flashcardsSortingMethod,
                notificationsPermissionStatus,
                sessionLength,
                sessionMode,
                sessionSpeechSynthesizer,
                setAppTheme,
                setAskedNotificationsThisSession,
                setAskLaterNotifications,
                setFlashcardSide,
                setFlashcardsSortingMethod,
                setNotificationsPermissionStatus,
                setSessionLength,
                setSessionMode,
                setSessionSpeechSynthesizer,
                setSoundEffectsEnabled,
                setUserHasEverHitFlashcard,
                setUserHasEverSeenSuggestionInSession,
                setUserHasEverSkippedSuggestion,
                setVibrationsEnabled,
                soundEffectsEnabled,
                userHasEverHitFlashcard,
                userHasEverSeenSuggestionInSession,
                userHasEverSkippedSuggestion,
                vibrationsEnabled,
            }}
        >
            {children}
        </UserPreferencesContext.Provider>
    );
};

export const useUserPreferences = () => {
    const context = useContext(UserPreferencesContext);
    if (!context) {
        throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
    }
    return context;
};
