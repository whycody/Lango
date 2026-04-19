import { SessionMode } from './Session';
import { UserProvider } from './User';
import { FlashcardSide, SessionLength } from './UserPreferences';

export const AnalyticsEventName = {
    CHECK_UPDATES: 'check_updates',
    ENABLE_NOTIFICATIONS_SHEET_OPEN: 'enable_notifications_sheet_open',
    FINISH_SESSION_SHEET_OPEN: 'finish_session_sheet_open',
    FLIP_FLASHCARD: 'flip_flashcard',
    HANDLE_FLASHCARD_SHEET_OPEN: 'handle_flashcard_sheet_open',
    HOME_REFRESH: 'home_refresh',
    LANGUAGE_SHEET_OPEN: 'language_sheet_open',
    LEAVE_SESSION_SHEET_OPEN: 'leave_session_sheet_open',
    LOGIN_FAILURE: 'login_failure',
    LOGIN_SUCCESS: 'login_success',
    LOGOUT_FAILURE: 'logout_failure',
    LOGOUT_FORCED: 'logout_forced',
    LOGOUT_SUCCESS: 'logout_success',
    MICROPHONE_WORD_INPUT: 'microphone_word_input',
    NAVIGATE_FLASHCARDS: 'navigate_flashcards',
    NAVIGATE_HOME: 'navigate_home',
    NAVIGATE_LIBRARY: 'navigate_library',
    NAVIGATE_SETTINGS: 'navigate_settings',
    NOTIFICATIONS_DISABLE: 'notifications_disable',
    NOTIFICATIONS_ENABLE_FAILURE: 'notifications_enable_failure',
    NOTIFICATIONS_ENABLE_SUCCESS: 'notifications_enable_success',
    ONBOARDING_FINISHED: 'onboarding_finished',
    ONBOARDING_INITIALIZED: 'onboarding_initialized',
    OPEN_PRIVACY_POLICY: 'open_privacy_policy',
    OPEN_USE_CONDITIONS: 'open_use_conditions',
    REMOVE_FLASHCARD_SHEET_OPEN: 'remove_flashcard_sheet_open',
    SEARCH_FLASHCARD: 'search_flashcard',
    SESSION_ADD_SUGGESTION: 'session_add_suggestion',
    SESSION_COMPLETED: 'session_completed',
    SESSION_SETTINGS_SHEET_OPEN: 'session_settings_sheet_open',
    SESSION_SKIP_SUGGESTION: 'session_skip_suggestion',
    SESSION_SKIPPED: 'session_skipped',
    SESSION_STARTED: 'session_started',
    SORTING_METHODS_SHEET_OPEN: 'sorting_methods_sheet_open',
    START_SESSION_SHEET_OPEN: 'start_session_sheet_open',
    SUGGESTION_ADD: 'suggestion_add',
    SUGGESTIONS_SKIPPED: 'suggestions_skipped',
    UPDATE_FAILURE: 'update_failure',
    UPDATE_SUCCESS: 'update_success',
    USER_SET: 'user_set',
    WORD_ADD_FAILURE: 'word_add_failure',
    WORD_ADD_SUCCESS: 'word_add_success',
} as const;

export type AnalyticsEventNameType = (typeof AnalyticsEventName)[keyof typeof AnalyticsEventName];

export type AnalyticsEventPayloadMap = {
    check_updates?: undefined;
    enable_notifications_sheet_open?: undefined;
    finish_session_sheet_open?: undefined;
    flip_flashcard?: undefined;
    handle_flashcard_sheet_open: {
        mode: 'add' | 'edit';
        source: 'main_screen' | 'flashcards_screen' | 'session_screen';
    };
    home_refresh?: undefined;
    language_sheet_open?: {
        source: 'main_screen' | 'library_screen' | 'settings_screen';
        type: 'main' | 'translation' | 'app';
    };
    leave_session_sheet_open?: undefined;
    login_failure: { provider: UserProvider; raw?: string; reason: string };
    login_success: { provider: UserProvider };
    logout_failure: { provider: UserProvider; reason: string };
    logout_forced?: undefined;
    logout_success: { provider: UserProvider };
    microphone_word_input?: undefined;
    navigate_flashcards?: undefined;
    navigate_home?: undefined;
    navigate_library?: undefined;
    navigate_settings?: undefined;
    notifications_disable?: undefined;
    notifications_enable_failure?: { reason: string };
    notifications_enable_success?: undefined;
    onboarding_finished?: undefined;
    onboarding_initialized?: undefined;
    open_privacy_policy?: undefined;
    open_use_conditions?: undefined;
    remove_flashcard_sheet_open?: undefined;
    search_flashcard?: undefined;
    session_add_suggestion?: undefined;
    session_completed: {
        avgGrade: number;
        flashcardSide: FlashcardSide;
        length: SessionLength;
        mode: SessionMode;
    };
    session_settings_sheet_open?: undefined;
    session_skip_suggestion?: undefined;
    session_skipped: {
        evaluatedCount: number;
        flashcardSide: FlashcardSide;
        length: SessionLength;
        mode: SessionMode;
    };
    session_started: {
        flashcardSide: FlashcardSide;
        length: SessionLength;
        mode: SessionMode;
        restarted: boolean;
    };
    sorting_methods_sheet_open?: undefined;
    start_session_sheet_open?: undefined;
    suggestion_add: { successfully: boolean; suggestionId: string };
    suggestions_skipped?: undefined;
    update_failure: { reason: string };
    update_success?: undefined;
    user_set: { online: boolean };
    word_add_failure: { reason: string; wordId: string };
    word_add_success: { wordId: string };
};
