import React, { FC } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../constants/margins';
import { WordWithDetails } from '../../types/utils/WordWithDetails';
import { getLevelColor } from '../../utils/getLevelColor';
import { ActionButton, Header, StatRow } from '../components';
import { CustomText } from '../components/CustomText';
import { CustomTheme } from '../Theme';
import { GenericBottomSheet } from './GenericBottomSheet';

export const FLASHCARD_DETAIL_BOTTOM_SHEET = 'flashcard-detail-bottom-sheet';

type FlashcardDetailBottomSheetProps = {
    onEdit?: () => void;
    onRemove?: () => void;
    word: WordWithDetails | undefined;
};

export const FlashcardDetailBottomSheet: FC<FlashcardDetailBottomSheetProps> = ({
    onEdit,
    onRemove,
    word,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const styles = getStyles(colors);

    const handleDismiss = () => {
        TrueSheet.dismiss(FLASHCARD_DETAIL_BOTTOM_SHEET);
    };

    const levelColor = word ? getLevelColor(word.gradeThreeProb) : colors.white300;
    const levelPercent = word ? Math.round(word.gradeThreeProb * 100) : 0;

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });

    const addDateLabel = word ? formatDate(word.addDate) : '—';
    const editedDateLabel = word?.updatedAt ? formatDate(word.updatedAt) : null;

    const lastRepetitionLabel = (() => {
        if (!word || word.hoursSinceLastRepetition === 0) return '—';
        const h = word.hoursSinceLastRepetition;
        if (h < 24) return `${Math.round(h)}h`;
        return `${Math.round(h / 24)}d`;
    })();

    return (
        <GenericBottomSheet sheetName={FLASHCARD_DETAIL_BOTTOM_SHEET}>
            <View style={styles.root}>
                {word && (
                    <>
                        <View style={styles.header}>
                            <Header subtitle={word.translation} title={word.text} />
                        </View>

                        <View style={styles.cardMetaPills}>
                            <View style={styles.cardMetaRow}>
                                <CustomText style={styles.cardMetaText}>
                                    <CustomText style={styles.cardMetaTextBold} weight="SemiBold">
                                        {t('addedOn')}:
                                    </CustomText>{' '}
                                    {addDateLabel}
                                </CustomText>
                            </View>
                            {editedDateLabel && (
                                <View style={styles.cardMetaRow}>
                                    <CustomText style={styles.cardMetaText}>
                                        <CustomText
                                            style={styles.cardMetaTextBold}
                                            weight="SemiBold"
                                        >
                                            {t('editedOn')}:
                                        </CustomText>{' '}
                                        {editedDateLabel}
                                    </CustomText>
                                </View>
                            )}
                        </View>

                        <View style={styles.card}>
                            <View style={styles.levelHeader}>
                                <CustomText style={styles.levelLabel} weight="SemiBold">
                                    {t('masteryLevel')}
                                </CustomText>
                                <CustomText
                                    style={[styles.levelPercent, { color: levelColor }]}
                                    weight="Bold"
                                >
                                    {levelPercent}%
                                </CustomText>
                            </View>

                            <View style={styles.progressTrack}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            backgroundColor: levelColor,
                                            width: `${levelPercent}%`,
                                        },
                                    ]}
                                />
                            </View>
                        </View>

                        <View style={styles.statsList}>
                            <StatRow
                                color={colors.primary300}
                                icon="repeat"
                                label={t('repetitions')}
                                value={String(word.repetitionsCount)}
                            />
                            <StatRow
                                color={colors.orange}
                                icon="flame"
                                label={t('correct_streak')}
                                value={String(word.studyStreak)}
                            />
                            <StatRow
                                color={colors.yellow}
                                icon="time-outline"
                                label={t('lastRepetition')}
                                value={lastRepetitionLabel}
                            />
                        </View>

                        <View style={styles.bottomSection}>
                            {(onEdit || onRemove) && (
                                <View style={styles.actionRow}>
                                    {onEdit && (
                                        <Pressable style={styles.actionBtn} onPress={onEdit}>
                                            <Ionicons
                                                color={colors.white}
                                                name="pencil-outline"
                                                size={18}
                                            />
                                            <CustomText
                                                style={styles.actionBtnText}
                                                weight="SemiBold"
                                            >
                                                {t('edit')}
                                            </CustomText>
                                        </Pressable>
                                    )}
                                    {onRemove && (
                                        <Pressable style={styles.actionBtn} onPress={onRemove}>
                                            <Ionicons
                                                color={colors.red}
                                                name="trash-outline"
                                                size={18}
                                            />
                                            <CustomText
                                                style={styles.actionBtnTextDelete}
                                                weight="SemiBold"
                                            >
                                                {t('delete')}
                                            </CustomText>
                                        </Pressable>
                                    )}
                                </View>
                            )}
                            <ActionButton
                                primary
                                label={t('common.got_it')}
                                style={styles.gotItButton}
                                onPress={handleDismiss}
                            />
                        </View>
                    </>
                )}
            </View>
        </GenericBottomSheet>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        actionBtn: {
            alignItems: 'center',
            borderColor: colors.cardAccent300,
            borderRadius: spacing.m,
            borderWidth: 1,
            flex: 1,
            flexDirection: 'row',
            gap: spacing.s,
            justifyContent: 'center',
            paddingVertical: spacing.m,
        },
        actionBtnText: {
            color: colors.white,
            fontSize: 13,
        },
        actionBtnTextDelete: {
            color: colors.red,
            fontSize: 13,
        },
        actionRow: {
            flexDirection: 'row',
            gap: spacing.m,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: spacing.m,
        },
        bottomSection: {
            marginBottom: MARGIN_VERTICAL,
            marginTop: spacing.m,
        },
        card: {
            borderRadius: spacing.l,
            padding: spacing.xl,
        },
        cardMetaPills: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.s,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: spacing.xl,
        },
        cardMetaRow: {
            alignItems: 'center',
            alignSelf: 'flex-start',
            backgroundColor: colors.cardAccent600,
            borderRadius: spacing.s,
            flexDirection: 'row',
            gap: spacing.s,
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.s,
        },
        cardMetaText: {
            color: colors.white300,
            fontSize: 12,
        },
        cardMetaTextBold: {
            color: colors.white,
            fontSize: 12,
        },
        gotItButton: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: spacing.l,
        },
        header: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: spacing.l,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: spacing.m,
        },
        levelHeader: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: spacing.m,
            marginBottom: spacing.m,
        },
        levelLabel: {
            color: colors.white,
            flex: 1,
            fontSize: 13,
        },
        levelPercent: {
            fontSize: 13,
        },
        progressFill: {
            borderRadius: 3,
            height: 7,
        },
        progressTrack: {
            backgroundColor: colors.cardAccent300,
            borderRadius: 3,
            height: 7,
            overflow: 'hidden',
            width: '100%',
        },
        root: {
            marginBottom: -MARGIN_VERTICAL,
        },
        statsList: {
            marginHorizontal: MARGIN_HORIZONTAL,
        },
    });
