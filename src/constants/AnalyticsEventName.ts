import { SessionMode, UserProvider } from "../types";
import { FlashcardSide, SessionLength } from "../store/UserPreferencesContext";

export const AnalyticsEventName = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT_SUCCESS: 'logout_success',
  LOGOUT_FAILURE: 'logout_failure',

  USER_SET: 'user_set',
  HOME_REFRESH: 'home_refresh',
  SEARCH_FLASHCARD: 'search_flashcard',

  CHECK_UPDATES: 'check_updates',
  UPDATE_SUCCESS: 'update_success',
  UPDATE_FAILURE: 'update_failure',

  NOTIFICATIONS_ENABLE_SUCCESS: 'notifications_enable_success',
  NOTIFICATIONS_ENABLE_FAILURE: 'notifications_enable_failure',
  NOTIFICATIONS_DISABLE: 'notifications_disable',

  ENABLE_NOTIFICATIONS_SHEET_OPEN: 'start_session_sheet_open',
  START_SESSION_SHEET_OPEN: 'start_session_sheet_open',
  HANDLE_FLASHCARD_SHEET_OPEN: 'handle_flashcard_sheet_open',
  LANGUAGE_SHEET_OPEN: 'language_sheet_open',
  SESSION_SETTINGS_SHEET_OPEN: 'session_settings_sheet_open',
  LEAVE_SESSION_SHEET_OPEN: 'leave_session_sheet_open',
  FINISH_SESSION_SHEET_OPEN: 'finish_session_sheet_open',
  REMOVE_FLASHCARD_SHEET_OPEN: 'remove_flashcard_sheet_open',
  SORTING_METHODS_SHEET_OPEN: 'sorting_methods_sheet_open',

  FLIP_FLASHCARD: 'flip_flashcard',
  SESSION_STARTED: 'session_started',
  SESSION_COMPLETED: 'session_completed',
  SESSION_SKIPPED: 'session_skipped',

  SUGGESTION_ADD: 'suggestion_add',
  SUGGESTIONS_SKIPPED: 'suggestions_skipped',
  WORD_ADD_SUCCESS: 'word_add_success',
  WORD_ADD_FAILURE: 'word_add_failure',

  ONBOARDING_INITIALIZED: 'onboarding_initialized',
  ONBOARDING_FINISHED: 'onboarding_finished',

  NAVIGATE_HOME: 'navigate_home',
  NAVIGATE_LIBRARY: 'navigate_library',
  NAVIGATE_FLASHCARDS: 'navigate_flashcards',
  NAVIGATE_SETTINGS: 'navigate_settings',

  OPEN_PRIVACY_POLICY: 'open_privacy_policy',
  OPEN_USE_CONDITIONS: 'open_use_conditions',
} as const;

export type AnalyticsEventName = typeof AnalyticsEventName[keyof typeof AnalyticsEventName];

export type AnalyticsEventPayloadMap = {
  login_success: { provider: UserProvider };
  login_failure: { provider: UserProvider; reason: string; raw?: string };
  logout_success: { provider: UserProvider };
  logout_failure: { provider: UserProvider; reason: string };

  user_set: { online: boolean };
  home_refresh?: undefined;

  check_updates?: undefined;
  update_success?: undefined;
  update_failure: { reason: string };

  notifications_enable_success?: undefined;
  notifications_enable_failure?: { reason: string };
  notifications_disable?: undefined;

  enable_notifications_sheet_open?: undefined;
  start_session_sheet_open?: undefined;
  handle_flashcard_sheet_open: { mode: 'add' | 'edit', source: 'main_screen' | 'flashcards_screen' | 'session_screen' };
  language_sheet_open?: {
    source: 'main_screen' | 'library_screen' | 'settings_screen',
    type: 'main' | 'translation' | 'app'
  };
  session_settings_sheet_open?: undefined;
  leave_session_sheet_open?: undefined;
  finish_session_sheet_open?: undefined;
  remove_flashcard_sheet_open?: undefined;
  sorting_methods_sheet_open?: undefined;

  flip_flashcard?: undefined;
  session_started: { length: SessionLength, mode: SessionMode, flashcardSide: FlashcardSide, restarted: boolean };
  session_completed: { length: SessionLength, mode: SessionMode, flashcardSide: FlashcardSide, avgGrade: number };
  session_skipped: { length: SessionLength, mode: SessionMode, flashcardSide: FlashcardSide, evaluatedCount: number };

  suggestion_add: { suggestionId: string, successfully: boolean };
  suggestions_skipped?: undefined;
  word_add_success: { wordId: string };
  word_add_failure: { wordId: string; reason: string };

  onboarding_initialized?: undefined;
  onboarding_finished?: undefined;

  navigate_home?: undefined;
  navigate_library?: undefined;
  navigate_flashcards?: undefined;
  navigate_settings?: undefined;

  open_privacy_policy?: undefined;
  open_use_conditions?: undefined;
};