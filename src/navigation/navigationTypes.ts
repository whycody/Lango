import { SessionMode } from '../constants/Session';
import { FlashcardSide, SessionLength } from '../constants/UserPreferences';

export type SessionScreenParams = {
    flashcardSide: FlashcardSide;
    length: SessionLength;
    mode: SessionMode;
};

export type RootStackParamList = {
    Flashcards: undefined;
    Session: SessionScreenParams;
    Settings: undefined;
    Tabs: undefined;
};

export enum ScreenName {
    Flashcards = 'Flashcards',
    Session = 'Session',
    Settings = 'Settings',
    Tabs = 'Tabs',
}