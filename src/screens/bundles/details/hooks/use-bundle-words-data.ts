import { useMemo, useRef } from 'react';

import { FlashcardSortingMethod } from '../../../../constants/UserPreferences';
import {
    useUserPreferences,
    useWordsMLStatesContext,
    useWordsWithDetails,
} from '../../../../store';
import { WordsBundleWithOwnerInfo } from '../../../../types';
import { MasteryFilter } from '../../../../ui/sheets/MasteryFilterBottomSheet';
import {
    compareByAddDate,
    getSortingMethod,
    matchesMasteryFilter,
} from '../../../../utils/sortingUtil';
import { BundleWord } from '../types';
import { useBundleWordsQuery } from './use-bundle-words-query';

export const useBundleWordsData = (
    bundleId: string,
    isPreview: boolean,
    isPrivatePreview: boolean,
    previewOwnerInfo: WordsBundleWithOwnerInfo | null,
    masteryFilter: MasteryFilter,
    isJoiningBundle: boolean,
) => {
    const { langWordsWithDetails } = useWordsWithDetails();
    const { langWordsMLStates } = useWordsMLStatesContext();
    const { flashcardsSortingMethod } = useUserPreferences();

    const shouldFetchBundleWords = isPreview && !isPrivatePreview;

    const {
        data: remoteBundleWords,
        isFetching: isBundleWordsFetching,
        refetch: refetchBundleWords,
    } = useBundleWordsQuery(bundleId, shouldFetchBundleWords);

    const localBundleWords = useMemo(
        () => langWordsWithDetails.filter(word => word.bundleId === bundleId),
        [langWordsWithDetails, bundleId],
    );

    const previewBundleWords = useMemo<BundleWord[]>(
        () => (remoteBundleWords ?? []).map(word => ({ ...word, gradeThreeProb: 0 })),
        [remoteBundleWords],
    );

    // Joining a public bundle commits to WordsBundleContext (membership) and
    // WordsContext (words) separately, so there's a render in between where
    // isPreview has already flipped false but localBundleWords hasn't caught
    // up yet - keep showing the already-fetched preview words through that
    // gap instead of flashing to empty.
    const stillWaitingForLocalWords =
        localBundleWords.length === 0 && previewBundleWords.length > 0;

    const bundleWords: BundleWord[] =
        isPreview || stillWaitingForLocalWords ? previewBundleWords : localBundleWords;

    // While joining, localBundleWords grows incrementally as words sync in, which
    // would make the displayed count creep up word-by-word. Remember the total
    // from the preview (captured just before joining starts) and keep showing it
    // until the join finishes, instead of the fluctuating local count.
    const joiningFlashcardsCountRef = useRef<number | undefined>(undefined);
    if (isPreview && previewOwnerInfo) {
        joiningFlashcardsCountRef.current = previewOwnerInfo.flashcardsCount;
    } else if (!isJoiningBundle) {
        joiningFlashcardsCountRef.current = undefined;
    }

    const flashcardsCount = (() => {
        if (isPreview) return previewOwnerInfo?.flashcardsCount ?? bundleWords.length;
        if (isJoiningBundle) return joiningFlashcardsCountRef.current ?? bundleWords.length;
        return bundleWords.length;
    })();

    const bundleWordsMLStates = useMemo(() => {
        const bundleWordIds = new Set(bundleWords.map(word => word.id));
        return langWordsMLStates?.filter(state => bundleWordIds.has(state.wordId)) ?? [];
    }, [langWordsMLStates, bundleWords]);

    // Preview words have no mastery/repetition data yet (see gradeThreeProb: 0
    // above), so grade- and repetition-based sorting would be meaningless.
    // Fall back to add-date sorting, honoring the ascending case if that's
    // the user's actual preference and defaulting to descending otherwise.
    const previewSortingMethod =
        flashcardsSortingMethod === FlashcardSortingMethod.ADD_DATE_ASC
            ? FlashcardSortingMethod.ADD_DATE_ASC
            : FlashcardSortingMethod.ADD_DATE_DESC;

    const words = useMemo(() => {
        if (isPreview || stillWaitingForLocalWords) {
            const direction = previewSortingMethod === FlashcardSortingMethod.ADD_DATE_ASC ? 1 : -1;
            return previewBundleWords.slice().sort(compareByAddDate(direction));
        }

        return localBundleWords
            .filter(word => matchesMasteryFilter(word, masteryFilter))
            .sort(getSortingMethod(flashcardsSortingMethod));
    }, [
        isPreview,
        stillWaitingForLocalWords,
        previewBundleWords,
        previewSortingMethod,
        localBundleWords,
        masteryFilter,
        flashcardsSortingMethod,
    ]);

    return {
        bundleWords,
        bundleWordsMLStates,
        flashcardsCount,
        isBundleWordsFetching,
        localBundleWords,
        previewSortingMethod,
        refetchBundleWords,
        remoteBundleWords,
        words,
    };
};
