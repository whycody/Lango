import { LanguageTypes } from './Language';

export enum SettingsItems {
    MAIN_LANGUAGE = LanguageTypes.MAIN,
    TRANSLATION_LANGUAGE = LanguageTypes.TRANSLATION,
    APPLICATION_LANGUAGE = LanguageTypes.APPLICATION,
    VIBRATIONS = 'vibrations',
    NOTIFICATIONS = 'notifications',
    SUGGESTIONS_IN_SESSION = 'suggestions_in_session',
    FLASHCARD_SIDE = 'flashcard_side',
    SESSION_SPEECH_SYNTHESIZER = 'session_speech_synthesizer',
    EMAIL_ADDRESS = 'email_address',
    DELETE_ACCOUNT = 'delete_account',
}

export enum SettingsSections {
    LANGUAGE,
    PREFERENCES,
    SESSION,
    ACCOUNT,
}
