import { memo, useMemo } from 'react';
import { ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { GRADE_THREE_PROB_THRESHOLDS } from '../../../../constants/Evaluation';
import { useHaptics } from '../../../../hooks';
import { useWordsWithDetails } from '../../../../store';
import { EnrichedWordsBundle } from '../../../../store/WordsBundleContext';
import { CustomTheme } from '../../../../ui/Theme';
import { BundleActionSlot, BundleCardItem } from '../../common/components';
import { ACTION_SLOT_SIZE } from '../../common/constants';
import { MasteryRing } from './mastery-ring';

interface BundleListItemProps {
    bundle: EnrichedWordsBundle;
    index: number;
    onPlayPress?: (bundle: EnrichedWordsBundle) => void;
    onPress?: (bundle: EnrichedWordsBundle) => void;
    style?: ViewStyle;
}

export const BundleListItem = memo<BundleListItemProps>(
    ({ bundle, index, onPlayPress, onPress, style }) => {
        const { colors } = useTheme() as CustomTheme;
        const { triggerHaptics } = useHaptics();
        const { langWordsWithDetails } = useWordsWithDetails();

        const bundleWords = useMemo(
            () => langWordsWithDetails.filter(word => word.bundleId === bundle.id),
            [langWordsWithDetails, bundle.id],
        );

        const wordCounts = useMemo(() => {
            const counts = { learning: 0, mastered: 0, review: 0 };

            bundleWords.forEach(word => {
                if (word.gradeThreeProb <= GRADE_THREE_PROB_THRESHOLDS.BAD_MAX) {
                    counts.learning++;
                } else if (word.gradeThreeProb >= GRADE_THREE_PROB_THRESHOLDS.GOOD_MIN) {
                    counts.mastered++;
                } else {
                    counts.review++;
                }
            });

            return counts;
        }, [bundleWords]);

        const hasWords = bundleWords.length > 0;

        const handlePlayPress = () => {
            if (!hasWords) return;
            onPlayPress?.(bundle);
            triggerHaptics('light');
        };

        return (
            <BundleCardItem
                flashcardsCount={bundleWords.length}
                index={index}
                ownerId={bundle.ownerId}
                style={style}
                title={bundle.title}
                actionSlot={
                    <BundleActionSlot
                        buttonDisabled={!hasWords}
                        buttonIcon="play"
                        buttonIconColor={hasWords ? colors.primary300 : colors.white300}
                        ring={
                            <MasteryRing
                                learningCount={wordCounts.learning}
                                masteredCount={wordCounts.mastered}
                                reviewCount={wordCounts.review}
                                size={ACTION_SLOT_SIZE}
                            />
                        }
                        onButtonPress={handlePlayPress}
                    />
                }
                onPress={() => onPress?.(bundle)}
            />
        );
    },
);
