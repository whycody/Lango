import React, { FC } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';

import { GRADE_THREE_PROB_THRESHOLDS } from '../../../constants/Evaluation';
import { MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { WordMLState } from '../../../types/states/WordMLState';
import {
    FLASHCARD_CLASSES_INFO_SHEET,
    FlashcardClassesInfoBottomSheet,
} from '../../sheets/FlashcardClassesInfoBottomSheet';
import { MasteryFilter } from '../../sheets/MasteryFilterBottomSheet';
import { CustomTheme } from '../../Theme';
import { CustomText } from '../CustomText';

type Props = {
    mlStates: WordMLState[];
    onBadgePress?: (masteryFilter: MasteryFilter) => void;
};

export const FlashcardClassBadges: FC<Props> = ({ mlStates, onBadgePress }) => {
    const { colors } = useTheme() as CustomTheme;

    const badges: { color: string; filter: MasteryFilter; count: number }[] = [
        {
            color: colors.red,
            count: mlStates.filter(w => w.gradeThreeProb <= GRADE_THREE_PROB_THRESHOLDS.BAD_MAX)
                .length,
            filter: 'learning',
        },
        {
            color: colors.yellow,
            count: mlStates.filter(
                w =>
                    w.gradeThreeProb > GRADE_THREE_PROB_THRESHOLDS.BAD_MAX &&
                    w.gradeThreeProb < GRADE_THREE_PROB_THRESHOLDS.GOOD_MIN,
            ).length,
            filter: 'review',
        },
        {
            color: colors.green,
            count: mlStates.filter(w => w.gradeThreeProb >= GRADE_THREE_PROB_THRESHOLDS.GOOD_MIN)
                .length,
            filter: 'mastered',
        },
    ];

    return (
        <>
            <FlashcardClassesInfoBottomSheet />
            <View style={styles.row}>
                {badges.map(({ color, count, filter }) => (
                    <Pressable
                        key={filter}
                        style={[styles.pill, { backgroundColor: color + '22' }]}
                        onPress={() => onBadgePress?.(filter)}
                    >
                        <Ionicons color={color} name="albums" size={13} />
                        <CustomText style={[styles.count, { color: colors.white }]} weight={'Bold'}>
                            {count}
                        </CustomText>
                    </Pressable>
                ))}
                <Pressable
                    hitSlop={8}
                    style={styles.infoButton}
                    onPress={() => TrueSheet.present(FLASHCARD_CLASSES_INFO_SHEET)}
                >
                    <Ionicons
                        color={colors.white}
                        name="information-circle-outline"
                        size={18}
                        style={styles.infoIcon}
                    />
                </Pressable>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    count: {
        fontSize: 13,
    },
    infoButton: {
        justifyContent: 'center',
    },
    infoIcon: {
        opacity: 0.4,
    },
    pill: {
        alignItems: 'center',
        borderRadius: 20,
        flexDirection: 'row',
        gap: spacing.xs,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.s,
        marginTop: MARGIN_VERTICAL / 2,
    },
});
