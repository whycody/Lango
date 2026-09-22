import { SessionMode } from '../constants/Session';
import { FlashcardSide, SessionLength } from '../constants/UserPreferences';
import { WordsBundleWithOwnerInfo } from '../types';
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
    code?: string;
    isNewBundle?: boolean;
    justJoined?: boolean;
    previewBundle?: WordsBundleWithOwnerInfo;
};

export type RootStackParamList = {
    BundleNavigator: BundleNavigatorParams;
    Flashcards: FlashcardsScreenParams | undefined;
    SearchBundles: undefined;
    Session: SessionScreenParams;
    Settings: undefined;
    Tabs: undefined;
};

export type BundleMembersScreenParams = {
    bundleId: string;
    previewTitle?: string;
};

export type BundleStackParamList = {
    BundleFlashcards: BundleNavigatorParams;
    BundleMembers: BundleMembersScreenParams;
};

export enum ScreenName {
    BundleFlashcards = 'BundleFlashcards',
    BundleMembers = 'BundleMembers',
    BundleNavigator = 'BundleNavigator',
    Flashcards = 'Flashcards',
    SearchBundles = 'SearchBundles',
    Session = 'Session',
    Settings = 'Settings',
    Tabs = 'Tabs',
}
