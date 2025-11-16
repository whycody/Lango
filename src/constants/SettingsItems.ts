import { LanguageTypes } from "./LanguageTypes";

export enum SettingsItems {
  MAIN_LANGUAGE = LanguageTypes.MAIN,
  TRANSLATION_LANGUAGE = LanguageTypes.TRANSLATION,
  APPLICATION_LANGUAGE = LanguageTypes.APPLICATION,
  VIBRATIONS = 'vibrations',
  NOTIFICATIONS = 'notifications',
  FLASHCARD_SIDE = 'flashcard_side',
  SESSION_SPEECH_SYNTHESIZER = 'session_speech_synthesizer',
}