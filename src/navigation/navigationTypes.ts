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

export type BundleDetailsScreenParams = {
    bundleId: string;
};

export type RootStackParamList = {
    BundleDetails: BundleDetailsScreenParams;
    Flashcards: FlashcardsScreenParams | undefined;
    Session: SessionScreenParams;
    Settings: undefined;
    Tabs: undefined;
};

export enum ScreenName {
    BundleDetails = 'BundleDetails',
    Flashcards = 'Flashcards',
    Session = 'Session',
    Settings = 'Settings',
    Tabs = 'Tabs',
}
