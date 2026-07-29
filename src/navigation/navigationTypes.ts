import { SessionMode } from '../constants/Session';
import { FlashcardSide, SessionLength } from '../constants/UserPreferences';
import { MasteryFilter } from '../ui/sheets/MasteryFilterBottomSheet';

export type SessionScreenParams = {
    bundleId?: string;
    flashcardSide: FlashcardSide;
    length: SessionLength;
    mode: SessionMode;
};

export type FlashcardsScreenParams = {
    masteryFilter?: MasteryFilter;
};

export type BundleNavigatorParams = {
    bundleId: string;
};

export type RootStackParamList = {
    BundleNavigator: BundleNavigatorParams;
    Flashcards: FlashcardsScreenParams | undefined;
    Session: SessionScreenParams;
    Settings: undefined;
    Tabs: undefined;
};

export type BundleStackParamList = {
    BundleFlashcards: BundleNavigatorParams;
};

export enum ScreenName {
    BundleFlashcards = 'BundleFlashcards',
    BundleNavigator = 'BundleNavigator',
    Flashcards = 'Flashcards',
    Session = 'Session',
    Settings = 'Settings',
    Tabs = 'Tabs',
}
