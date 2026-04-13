import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { BOTTOM_SHEET_GRABBER_OPTIONS } from '../../constants/Common';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { ActionButton, CustomText } from '../components';
import { CustomTheme } from '../Theme';

type LeaveSessionBottomSheetProps = {
    leaveSession: () => void;
    sheetName: string;
};

export const LeaveSessionBottomSheet = (props: LeaveSessionBottomSheetProps) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);
    const { t } = useTranslation();

    return (
        <TrueSheet
            backgroundColor={colors.card}
            detents={['auto']}
            grabberOptions={BOTTOM_SHEET_GRABBER_OPTIONS}
            name={props.sheetName}
        >
            <View style={styles.root}>
                <CustomText style={styles.title} weight={'Bold'}>
                    {t('finishingSession')}
                </CustomText>
                <CustomText style={styles.subtitle}>{t('finishingSessionDesc')}</CustomText>

                <ActionButton
                    label={t('finish')}
                    primary={true}
                    style={styles.button}
                    onPress={props.leaveSession}
                />
                <CustomText
                    style={styles.actionText}
                    weight={'SemiBold'}
                    onPress={() => TrueSheet.dismiss(props.sheetName)}
                >
                    {t('cancel')}
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
        button: {
            marginTop: MARGIN_VERTICAL,
        },
        header: {
            paddingTop: MARGIN_VERTICAL,
        },
        root: {
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: MARGIN_VERTICAL,
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
