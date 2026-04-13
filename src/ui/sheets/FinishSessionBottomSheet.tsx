import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { BOTTOM_SHEET_GRABBER_OPTIONS } from '../../constants/Common';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { WordUpdate } from '../../types';
import { ActionButton, CustomText } from '../components';
import { CustomTheme } from '../Theme';

type FinishSessionBottomSheetProps = {
    endSession: () => void;
    flashcardUpdates: WordUpdate[];
    sheetName: string;
    startNewSession: () => void;
};

export const FinishSessionBottomSheet = (props: FinishSessionBottomSheetProps) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);
    const { t } = useTranslation();

    const grade1Count = props.flashcardUpdates.filter(update => update.grade === 1).length;
    const grade2Count = props.flashcardUpdates.filter(update => update.grade === 2).length;
    const grade3Count = props.flashcardUpdates.filter(update => update.grade === 3).length;

    let messageKey = 'balancedEffort';

    if (props.flashcardUpdates.length == 0) {
        messageKey = 'no_updates';
    } else if (grade3Count > grade1Count && grade3Count > grade2Count) {
        messageKey = 'perfect';
    } else if (grade2Count > grade1Count && grade2Count > grade3Count) {
        messageKey = 'steadyImprovement';
    } else if (grade1Count > grade2Count && grade1Count > grade3Count) {
        messageKey = 'needsImprovement';
    } else if (grade3Count > 0 && grade2Count === 0 && grade1Count === 0) {
        messageKey = 'goodProgress';
    }

    return (
        <TrueSheet
            backgroundColor={colors.card}
            detents={['auto']}
            dismissible={false}
            grabberOptions={BOTTOM_SHEET_GRABBER_OPTIONS}
            name={props.sheetName}
        >
            <View style={styles.root}>
                <CustomText style={styles.title} weight={'Bold'}>
                    {t('sessionSummary')}
                </CustomText>

                {props.flashcardUpdates.length > 0 && (
                    <View style={styles.statusBar}>
                        <View
                            style={[
                                styles.statusBarSegment,
                                styles.grade3Bar,
                                { flex: grade3Count },
                            ]}
                        />
                        <View
                            style={[
                                styles.statusBarSegment,
                                styles.grade2Bar,
                                { flex: grade2Count },
                            ]}
                        />
                        <View
                            style={[
                                styles.statusBarSegment,
                                styles.grade1Bar,
                                { flex: grade1Count },
                            ]}
                        />
                    </View>
                )}

                <CustomText style={styles.subtitle}>
                    {t(messageKey, { grade1Count, grade2Count, grade3Count })}
                </CustomText>

                <ActionButton
                    label={t('finishingSession')}
                    primary={true}
                    style={styles.button}
                    onPress={props.endSession}
                />
                <CustomText
                    style={styles.actionText}
                    weight={'SemiBold'}
                    onPress={props.startNewSession}
                >
                    {t('startNextSession')}
                </CustomText>
            </View>
        </TrueSheet>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        actionText: {
            color: colors.primary,
            fontSize: 13,
            paddingVertical: MARGIN_VERTICAL,
            textAlign: 'center',
        },
        box: {
            alignItems: 'center',
            backgroundColor: colors.primary,
            height: 35,
            justifyContent: 'center',
            marginRight: 10,
            marginTop: 20,
            paddingHorizontal: 6,
        },
        button: {
            marginTop: MARGIN_VERTICAL,
        },
        grade1Bar: {
            backgroundColor: '#e48181',
        },
        grade2Bar: {
            backgroundColor: '#ead66c',
        },
        grade3Bar: {
            backgroundColor: '#73c576',
        },
        header: {
            paddingTop: MARGIN_VERTICAL,
        },
        progressBar: {
            backgroundColor: colors.background,
            height: 6,
            marginTop: 20,
        },
        root: {
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: MARGIN_VERTICAL,
        },
        sessionItemsContainer: {
            flex: 1,
            flexDirection: 'row',
            marginTop: 12,
        },
        statusBar: {
            flexDirection: 'row',
            paddingBottom: MARGIN_VERTICAL / 2,
            paddingTop: MARGIN_VERTICAL,
        },
        statusBarSegment: {
            height: 9,
        },
        subtitle: {
            color: colors.primary600,
            fontSize: 15,
            marginTop: MARGIN_VERTICAL / 2,
        },
        title: {
            color: colors.primary300,
            fontSize: 18,
            marginTop: 12,
        },
    });
