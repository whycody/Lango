import React, { ForwardedRef, forwardRef, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { ActionButton, CustomText } from '../components';

type LeaveSessionBottomSheetProps = {
    leaveSession: () => void;
    onChangeIndex?: (index: number) => void;
};

export const LeaveSessionBottomSheet = forwardRef<BottomSheetModal, LeaveSessionBottomSheetProps>(
    (props, ref: ForwardedRef<BottomSheetModal>) => {
        const { colors } = useTheme();
        const styles = getStyles(colors);
        const { t } = useTranslation();

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />
            ),
            [],
        );

        const dismiss = () => {
            ref && typeof ref !== 'function' && ref.current?.dismiss();
        };

        return (
            <BottomSheetModal
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.bottomSheetModal}
                handleIndicatorStyle={styles.handleIndicatorStyle}
                index={0}
                ref={ref}
                onChange={(index: number) => props.onChangeIndex?.(index)}
            >
                <BottomSheetScrollView style={styles.root}>
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
                    <CustomText style={styles.actionText} weight={'SemiBold'} onPress={dismiss}>
                        {t('cancel')}
                    </CustomText>
                </BottomSheetScrollView>
            </BottomSheetModal>
        );
    },
);

const getStyles = (colors: any) =>
    StyleSheet.create({
        actionText: {
            color: colors.primary,
            fontSize: 13,
            paddingVertical: MARGIN_VERTICAL,
            textAlign: 'center',
        },
        bottomSheetModal: {
            backgroundColor: colors.card,
        },
        button: {
            marginTop: MARGIN_VERTICAL,
        },
        handleIndicatorStyle: {
            backgroundColor: colors.primary,
            borderRadius: 0,
        },
        header: {
            paddingTop: MARGIN_VERTICAL,
        },
        root: {
            paddingHorizontal: MARGIN_HORIZONTAL,
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
