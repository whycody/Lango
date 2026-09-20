import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BundleStackParamList, ScreenName } from '../../../../navigation/navigationTypes';
import { EnrichedWordsBundle } from '../../../../store';
import { BundleMember } from '../../../../types';
import {
    BUNDLE_DETAILS_BUNDLE_READY_BOTTOM_SHEET,
    BUNDLE_DETAILS_JOIN_WITH_CODE_BOTTOM_SHEET,
} from '../constants';

type PendingContentAppearedAction = 'presentBundleReady' | 'startJoining' | null;

interface UseBundleLifecycleSheetsResult {
    isJoiningBundle: boolean;
    setIsJoiningBundle: Dispatch<SetStateAction<boolean>>;
}

export const useBundleLifecycleSheets = (
    navigation: NativeStackNavigationProp<BundleStackParamList, ScreenName.BundleFlashcards>,
    hasContentAppeared: boolean,
    isNewBundle?: boolean,
    justJoined?: boolean,
    joinCode?: string,
    membership?: BundleMember,
    localBundle?: EnrichedWordsBundle,
): UseBundleLifecycleSheetsResult => {
    const [isJoiningBundle, setIsJoiningBundle] = useState(false);
    const [pendingContentAppearedAction, setPendingContentAppearedAction] =
        useState<PendingContentAppearedAction>(null);

    // A bundle the user just created: present the "bundle ready" sheet once the
    // screen transition finishes, then clear the nav param so it only fires once.
    const handleNewBundleEntry = () => {
        const presentNewBundleSheet = () => {
            TrueSheet.present(BUNDLE_DETAILS_BUNDLE_READY_BOTTOM_SHEET);
            navigation.setParams({ isNewBundle: false });
        };

        return navigation.addListener('transitionEnd', presentNewBundleSheet);
    };

    // A bundle the user just joined: defer the follow-up action (present the
    // "bundle ready" sheet, or start the joining flow) until the content-appear
    // animation finishes, so it doesn't play under the transition.
    const handleJustJoinedEntry = () => {
        navigation.setParams({ justJoined: false });
        setPendingContentAppearedAction(
            localBundle?.wordsBackfilled ? 'presentBundleReady' : 'startJoining',
        );
    };

    // The user arrived via an invite code but isn't a member yet: prompt them to
    // enter it, after a short delay so it doesn't appear mid-transition.
    const handleJoinCodeEntry = () => {
        if (!joinCode || membership) return;

        const timeout = setTimeout(() => {
            TrueSheet.present(BUNDLE_DETAILS_JOIN_WITH_CODE_BOTTOM_SHEET);
        }, 500);

        return () => clearTimeout(timeout);
    };

    useEffect(() => {
        if (isNewBundle) return handleNewBundleEntry();
        if (justJoined) return handleJustJoinedEntry();
        return handleJoinCodeEntry();
    }, [isNewBundle, navigation]);

    // Words are still syncing while joining: once the backfill finishes, stop the
    // joining flow and present the "bundle ready" sheet.
    useEffect(() => {
        if (isJoiningBundle && localBundle?.wordsBackfilled) {
            setIsJoiningBundle(false);
            TrueSheet.present(BUNDLE_DETAILS_BUNDLE_READY_BOTTOM_SHEET);
        }
    }, [isJoiningBundle, localBundle?.wordsBackfilled]);

    // Run the action queued by handleJustJoinedEntry once the content-appear
    // animation reports it has finished.
    const consumePendingContentAppearedAction = () => {
        if (pendingContentAppearedAction === 'presentBundleReady') {
            TrueSheet.present(BUNDLE_DETAILS_BUNDLE_READY_BOTTOM_SHEET);
        } else {
            setIsJoiningBundle(true);
        }
        setPendingContentAppearedAction(null);
    };

    useEffect(() => {
        if (hasContentAppeared && pendingContentAppearedAction) {
            consumePendingContentAppearedAction();
        }
    }, [hasContentAppeared, pendingContentAppearedAction]);

    return { isJoiningBundle, setIsJoiningBundle };
};
