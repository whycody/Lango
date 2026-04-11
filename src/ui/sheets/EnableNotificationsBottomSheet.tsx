import React, { ForwardedRef, forwardRef, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { useUserPreferences } from '../../store';
import { trackEvent } from '../../utils/analytics';
import { ensureNotificationsPermission } from '../../utils/ensureNotificationPermission';
import { registerNotificationsToken } from '../../utils/registerNotificationsToken';
import { ActionButton, CustomText } from '../components/';

type EnableNotificationsBottomSheetProps = {
    onChangeIndex?: (index: number) => void;
};

export const EnableNotificationsBottomSheet = forwardRef<
    BottomSheetModal,
    EnableNotificationsBottomSheetProps
>((props, ref: ForwardedRef<BottomSheetModal>) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { t } = useTranslation();
    const { setAskLaterNotifications } = useUserPreferences();

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />
        ),
        [],
    );

    const dismiss = () => {
        ref && typeof ref !== 'function' && ref.current?.dismiss();
    };

    const askForNotificationPermission = async () => {
        const granted = await ensureNotificationsPermission();

        if (!granted) {
            trackEvent(AnalyticsEventName.NOTIFICATIONS_ENABLE_FAILURE, {
                reason: 'Permissions not granted',
            });
            return;
        }

        trackEvent(AnalyticsEventName.NOTIFICATIONS_ENABLE_SUCCESS);
        await registerNotificationsToken();
        dismiss();
    };

    const handleAskLater = () => {
        const askLaterUntil = Date.now() + 48 * 60 * 60 * 1000;
        setAskLaterNotifications(askLaterUntil);
        dismiss();
    };

    return (
        <BottomSheetModal
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.bottomSheetModal}
            enablePanDownToClose={false}
            handleIndicatorStyle={styles.handleIndicatorStyle}
            index={0}
            ref={ref}
            onChange={(index: number) => props.onChangeIndex?.(index)}
        >
            <BottomSheetScrollView style={styles.root}>
                <CustomText style={styles.title} weight={'Bold'}>
                    {t('turn_on_notifications_title')}
                </CustomText>
                <CustomText style={styles.subtitle}>{t('turn_on_notifications_desc')}</CustomText>

                <ActionButton
                    label={t('allow_notifications')}
                    primary={true}
                    style={styles.button}
                    onPress={askForNotificationPermission}
                />
                <CustomText style={styles.actionText} weight={'SemiBold'} onPress={handleAskLater}>
                    {t('ask_later')}
                </CustomText>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
});

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
