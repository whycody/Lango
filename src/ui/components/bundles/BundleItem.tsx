import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { GRADE_THREE_PROB_THRESHOLDS } from '../../../constants/Evaluation';
import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { useWordsWithDetails } from '../../../store';
import { EnrichedWordsBundle } from '../../../store/WordsBundleContext';
import { isIOS } from '../../../utils/deviceUtils';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';
import { BundleCreatorInfo } from '../home';
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
        const styles = getStyles(colors, index);
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

        const handlePress = () => {
            onPress?.(bundle);
            triggerHaptics('light');
        };

        const handlePlayPress = () => {
            onPlayPress?.(bundle);
            triggerHaptics('light');
        };

        return (
            <Pressable
                android_ripple={{
                    color: colors.cardAccent300,
                    foreground: true,
                }}
                style={({ pressed }) => [
                    styles.container,
                    pressed && isIOS && { opacity: 0.8 },
                    style,
                ]}
                onPress={handlePress}
            >
                <View style={styles.root}>
                    <View style={styles.textContainer}>
                        <CustomText numberOfLines={1} style={styles.label} weight="SemiBold">
                            {bundle.title}
                        </CustomText>
                        {bundle.description && (
                            <CustomText
                                numberOfLines={1}
                                style={styles.description}
                                weight="Regular"
                            >
                                {bundle.description}
                            </CustomText>
                        )}
                    </View>
                    <View style={styles.playButtonContainer}>
                        <View pointerEvents="none" style={styles.ring}>
                            <MasteryRing
                                learningCount={wordCounts.learning}
                                masteredCount={wordCounts.mastered}
                                reviewCount={wordCounts.review}
                                size={47}
                            />
                        </View>
                        <Pressable hitSlop={8} style={styles.playButton} onPress={handlePlayPress}>
                            <Ionicons color={colors.card} name="play" size={18} />
                        </Pressable>
                    </View>
                </View>
                <View style={styles.metaRow}>
                    <BundleCreatorInfo
                        compact
                        creatorId={bundle.ownerId}
                        flashcardsCount={bundleWords.length}
                        style={styles.creatorInfo}
                    />
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
                </View>
            </Pressable>
        );
    },
);

const getStyles = (colors: CustomTheme['colors'], index: number) =>
    StyleSheet.create({
        container: {
            marginTop: index === 0 ? 0 : 12,
        },
        creatorInfo: {
            marginTop: 0,
        },
        description: {
            color: colors.white,
            fontSize: 12,
            marginTop: 2,
            opacity: 0.7,
        },
        label: {
            color: colors.white,
            fontSize: 17,
        },
        metaRow: {
            alignItems: 'center',
            backgroundColor: colors.cardAccent300,
            borderRadius: spacing.m,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: spacing.s,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 6,
        },
        playButton: {
            alignItems: 'center',
            backgroundColor: colors.primary300,
            borderRadius: 100,
            height: 36,
            justifyContent: 'center',
            width: 36,
        },
        playButtonContainer: {
            alignItems: 'center',
            height: 44,
            justifyContent: 'center',
            marginLeft: 20,
            width: 44,
        },
        ring: {
            position: 'absolute',
        },
        root: {
            alignItems: 'center',
            backgroundColor: colors.card,
            borderBottomLeftRadius: spacing.none,
            borderBottomRightRadius: spacing.none,
            borderColor: colors.cardAccent300,
            borderRadius: spacing.m,
            borderWidth: 1,
            flexDirection: 'row',
            overflow: 'hidden',
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 10,
        },
        textContainer: {
            flex: 1,
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
