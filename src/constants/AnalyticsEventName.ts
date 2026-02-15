export const AnalyticsAuthEvents = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT_SUCCESS: 'logout_success',
  LOGOUT_FAILURE: 'logout_failure',
} as const;

export const AnalyticsSessionEvents = {
  SESSION_BAR_OPEN: 'session_bar_open',
  SESSION_STARTED: 'session_started',
  SESSION_COMPLETED: 'session_completed',
  SESSION_SKIPPED: 'session_skipped',
} as const;

export const AnalyticsSuggestionEvents = {
  SUGGESTION_ADDED: 'suggestion_added',
  SUGGESTIONS_SKIPPED: 'suggestions_skipped',
} as const;

export const AnalyticsNavigationEvents = {
  NAVIGATE_HOME: 'navigate_home',
  NAVIGATE_LIBRARY: 'navigate_library',
  NAVIGATE_FLASHCARDS: 'navigate_flashcards',
  NAVIGATE_SETTINGS: 'navigate_settings',
} as const;

export const AnalyticsEventName = {
  ...AnalyticsAuthEvents,
  ...AnalyticsSessionEvents,
  ...AnalyticsSuggestionEvents,
  ...AnalyticsNavigationEvents
} as const;

export type AnalyticsEventName =
  typeof AnalyticsEventName[keyof typeof AnalyticsEventName];