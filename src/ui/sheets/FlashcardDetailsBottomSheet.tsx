import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../constants/margins';
import { useWordsBundle } from '../../store/WordsBundleContext';
import { WordWithDetails } from '../../types/utils/WordWithDetails';
import { formatDisplayDate, formatHoursSince } from '../../utils/dateUtil';
import { getLevelColor } from '../../utils/getLevelColor';
import { ActionButton, Header, SecondaryButton, StatRow } from '../components';
import { CustomText } from '../components/CustomText';
import { CustomTheme } from '../Theme';
import { GenericBottomSheet } from './GenericBottomSheet';

export const FLASHCARD_DETAIL_BOTTOM_SHEET = 'flashcard-detail-bottom-sheet';

type FlashcardDetailsBottomSheetProps = {
    onEdit: () => void;
    onRemove: () => void;
    word: WordWithDetails | undefined;
};

export const FlashcardDetailsBottomSheet: FC<FlashcardDetailsBottomSheetProps> = ({
    onEdit,
    onRemove,
    word,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const styles = getStyles(colors);
    const { bundles } = useWordsBundle();

    const handleDismiss = () => {
        TrueSheet.dismiss(FLASHCARD_DETAIL_BOTTOM_SHEET);
    };

    const bundle = word?.bundleId ? bundles.find(b => b.id === word.bundleId) : undefined;
    const canEditOrRemove =
        !word?.bundleId ||
        bundle?.membership?.role === 'owner' ||
        bundle?.membership?.role === 'editor';

    const levelColor = word ? getLevelColor(word.gradeThreeProb) : colors.white300;
    const levelPercent = word ? Math.round(word.gradeThreeProb * 100) : 0;
    const addDateLabel = word ? formatDisplayDate(word.addDate) : '—';
    const lastRepetitionLabel = word ? formatHoursSince(word.hoursSinceLastRepetition) : '—';

    return (
        <GenericBottomSheet sheetName={FLASHCARD_DETAIL_BOTTOM_SHEET}>
            <View style={styles.root}>
                <View style={styles.header}>
                    <Header subtitle={word?.translation} title={word?.text ?? ''} />
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
                        value={String(word?.repetitionsCount)}
                    />
                    <StatRow
                        color={colors.orange}
                        icon="flame"
                        label={t('correct_streak')}
                        value={String(word?.studyStreak)}
                    />
                    <StatRow
                        color={colors.yellow}
                        icon="time-outline"
                        label={t('lastRepetition')}
                        value={lastRepetitionLabel}
                    />
                </View>

                <View style={styles.bottomSection}>
                    {canEditOrRemove && (
                        <View style={styles.actionRow}>
                            <SecondaryButton
                                icon="pencil-outline"
                                label={t('edit')}
                                onPress={onEdit}
                            />
                            <SecondaryButton
                                color={colors.red}
                                icon="trash-outline"
                                label={t('delete')}
                                onPress={onRemove}
                            />
                        </View>
                    )}

                    <ActionButton
                        primary
                        label={t('common.close')}
                        style={styles.gotItButton}
                        onPress={handleDismiss}
                    />
                </View>
            </View>
        </GenericBottomSheet>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
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
            fontSize: 13,
        },
        cardMetaTextBold: {
            color: colors.white,
            fontSize: 13,
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
            fontSize: 14,
        },
        levelPercent: {
            fontSize: 14,
        },
        progressFill: {
            borderRadius: 3,
            height: 8,
        },
        progressTrack: {
            backgroundColor: colors.cardAccent300,
            borderRadius: 3,
            height: 8,
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
