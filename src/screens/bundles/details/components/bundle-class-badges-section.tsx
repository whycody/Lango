import { FC } from 'react';
import { StyleSheet } from 'react-native';

import { MARGIN_HORIZONTAL } from '../../../../constants/margins';
import { WordMLState } from '../../../../types';
import { FlashcardClassBadges } from '../../../../ui/components/home';
import { MasteryFilter } from '../../../../ui/sheets/MasteryFilterBottomSheet';

interface BundleClassBadgesSectionProps {
    mlStates: WordMLState[];
    onMasteryFilterChange: (filter: MasteryFilter) => void;
}

export const BundleClassBadgesSection: FC<BundleClassBadgesSectionProps> = ({
    mlStates,
    onMasteryFilterChange,
}) => {
    const handleReviewWordsPress = () => onMasteryFilterChange('all');

    return (
        <FlashcardClassBadges
            mlStates={mlStates}
            style={styles.classBadges}
            onBadgePress={onMasteryFilterChange}
            onClassPress={onMasteryFilterChange}
            onReviewWordsPress={handleReviewWordsPress}
        />
    );
};

const styles = StyleSheet.create({
    classBadges: {
        marginHorizontal: MARGIN_HORIZONTAL,
    },
});
