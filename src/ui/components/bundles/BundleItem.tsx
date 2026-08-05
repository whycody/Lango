import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { GRADE_THREE_PROB_THRESHOLDS } from '../../../constants/Evaluation';
import { useHaptics } from '../../../hooks';
import { useWordsWithDetails } from '../../../store';
import { EnrichedWordsBundle } from '../../../store/WordsBundleContext';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';
import { BundleCardItem } from './BundleCardItem';
import { MasteryRing } from './MasteryRing';

interface BundleItemProps {
    bundle: EnrichedWordsBundle;
    index: number;
    onPlayPress?: (bundle: EnrichedWordsBundle) => void;
    onPress?: (bundle: EnrichedWordsBundle) => void;
    style?: ViewStyle;
}

export const BundleItem = memo<BundleItemProps>(
    ({ bundle, index, onPlayPress, onPress, style }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);
        const { triggerHaptics } = useHaptics();
        const { langWordsWithDetails } = useWordsWithDetails();

        const bundleWords = useMemo(
            () => langWordsWithDetails.filter(word => word.bundleId === bundle.id),
            [langWordsWithDetails, bundle.id],
        );

        const wordCounts = useMemo(
            () => ({
                learning: bundleWords.filter(
                    word => word.gradeThreeProb <= GRADE_THREE_PROB_THRESHOLDS.BAD_MAX,
                ).length,
                mastered: bundleWords.filter(
                    word => word.gradeThreeProb >= GRADE_THREE_PROB_THRESHOLDS.GOOD_MIN,
                ).length,
                review: bundleWords.filter(
                    word =>
                        word.gradeThreeProb > GRADE_THREE_PROB_THRESHOLDS.BAD_MAX &&
                        word.gradeThreeProb < GRADE_THREE_PROB_THRESHOLDS.GOOD_MIN,
                ).length,
            }),
            [bundleWords],
        );

        const handlePlayPress = () => {
            onPlayPress?.(bundle);
            triggerHaptics('light');
        };

        return (
            <BundleCardItem
                description={bundle.description}
                flashcardsCount={bundleWords.length}
                index={index}
                ownerId={bundle.ownerId}
                style={style}
                title={bundle.title}
                actionSlot={
                    <>
                        <View pointerEvents="none" style={styles.ring}>
                            <MasteryRing
                                learningCount={wordCounts.learning}
                                masteredCount={wordCounts.mastered}
                                reviewCount={wordCounts.review}
                                size={47}
                            />
                        </View>
                        <Pressable hitSlop={8} style={styles.playButton} onPress={handlePlayPress}>
                            <Ionicons color={colors.primary300} name="play" size={18} />
                        </Pressable>
                    </>
                }
                metaSlot={
                    <View style={styles.wordCounts}>
                        <Ionicons color={colors.white300} name="albums" size={14} />
                        <CustomText style={styles.wordCount} weight="SemiBold">
                            {wordCounts.mastered}
                        </CustomText>
                        <CustomText style={styles.wordCountSeparator} weight="SemiBold">
                            {'/'}
                        </CustomText>
                        <CustomText style={styles.wordCount} weight="SemiBold">
                            {bundleWords.length}
                        </CustomText>
                    </View>
                }
                onPress={() => onPress?.(bundle)}
            />
        );
    },
);

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        playButton: {
            alignItems: 'center',
            backgroundColor: colors.cardAccent600,
            borderRadius: 100,
            height: 36,
            justifyContent: 'center',
            width: 36,
        },
        ring: {
            position: 'absolute',
        },
        wordCount: {
            color: colors.white300,
            fontSize: 12,
        },
        wordCounts: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: 4,
        },
        wordCountSeparator: {
            color: colors.white300,
            fontSize: 12,
        },
    });
