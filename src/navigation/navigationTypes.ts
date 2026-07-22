import { SessionMode } from '../constants/Session';
import { FlashcardSide, SessionLength } from '../constants/UserPreferences';
import { MasteryFilter } from '../ui/sheets/MasteryFilterBottomSheet';

export type SessionScreenParams = {
    flashcardSide: FlashcardSide;
    length: SessionLength;
    mode: SessionMode;
};

export type FlashcardsScreenParams = {
    masteryFilter?: MasteryFilter;
};

export type RootStackParamList = {
    Flashcards: FlashcardsScreenParams | undefined;
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
