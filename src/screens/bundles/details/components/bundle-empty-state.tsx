import { FC } from 'react';

import { TranslationKey } from '../../../../types';
import { EmptyList } from '../../../../ui/components/flashcards';
import { FlashcardsSelectionSkeleton } from '../../../../ui/containers/onboarding/FlashcardsSelectionSkeleton';
import { MasteryFilter } from '../../../../ui/sheets/MasteryFilterBottomSheet';

interface BundleEmptyStateProps {
    canAddWords: boolean;
    flashcardsCount: number;
    hasBundle: boolean;
    isBundleWordsFetching: boolean;
    isJoiningBundle: boolean;
    isPrivatePreview: boolean;
    masteryFilter: MasteryFilter;
}

export const BundleEmptyState: FC<BundleEmptyStateProps> = ({
    canAddWords,
    flashcardsCount,
    hasBundle,
    isBundleWordsFetching,
    isJoiningBundle,
    isPrivatePreview,
    masteryFilter,
}) => {
    if (isBundleWordsFetching || !hasBundle || isJoiningBundle) {
        // 0 falls back to the skeleton's default row count instead of rendering no rows
        return <FlashcardsSelectionSkeleton count={flashcardsCount || undefined} />;
    }

    if (isPrivatePreview) {
        return (
            <EmptyList
                descriptionTx="bundle_details.no_access.desc"
                icon="lock-closed"
                titleTx="bundle_details.no_access.title"
            />
        );
    }

    const noItemsDescKey: TranslationKey =
        masteryFilter !== 'all'
            ? 'no_items_filter_desc'
            : canAddWords
              ? 'bundle_details.no_items_desc'
              : 'bundle_details.no_items_desc_readonly';

    return <EmptyList descriptionTx={noItemsDescKey} titleTx="no_items" />;
};
