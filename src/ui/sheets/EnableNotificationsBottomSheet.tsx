import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { MARGIN_HORIZONTAL } from '../../constants/margins';
import { useUserPreferences } from '../../store';
import { trackEvent } from '../../utils/analytics';
import {
    ensureNotificationsPermission,
    isNotificationPermissionGranted,
} from '../../utils/ensureNotificationPermission';
import { replaceLottieColor } from '../../utils/lottieUtils';
import { registerNotificationsToken } from '../../utils/registerNotificationsToken';
import { Header } from '../components';
import { CustomTheme } from '../Theme';
import { GenericBottomSheet } from './GenericBottomSheet';

type EnableNotificationsBottomSheetProps = {
    sheetName: string;
};

export const EnableNotificationsBottomSheet = (props: EnableNotificationsBottomSheetProps) => {
    const { sheetName } = props;
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const { askLaterNotifications, setAskLaterNotifications } = useUserPreferences();
    const planeSource = replaceLottieColor(require('../../../assets/plane.json'), [
        { from: '#2191fa', to: colors.primary },
        { from: '#2f2f47', to: colors.cardAccent },
    ]);
    const waitingForSettings = useRef(false);

    useEffect(() => {
        const handleAppStateChange = async (nextState: AppStateStatus) => {
            if (nextState !== 'active' || !waitingForSettings.current) return;
            waitingForSettings.current = false;

            const permissions = await Notifications.getPermissionsAsync();
            if (!isNotificationPermissionGranted(permissions)) return;

            trackEvent(AnalyticsEventName.NOTIFICATIONS_ENABLE_SUCCESS);
            await registerNotificationsToken();
            TrueSheet.dismiss(sheetName);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [sheetName]);

    const askForNotificationPermission = async () => {
        const granted = await ensureNotificationsPermission();

        if (!granted) {
            trackEvent(AnalyticsEventName.NOTIFICATIONS_ENABLE_FAILURE, {
                reason: 'Permissions not granted',
            });
            waitingForSettings.current = true;
            return;
        }

        trackEvent(AnalyticsEventName.NOTIFICATIONS_ENABLE_SUCCESS);
        await registerNotificationsToken();
        TrueSheet.dismiss(sheetName);
    };

    const handleAskLater = () => {
        const askLaterUntil = Date.now() + (askLaterNotifications ? 2 : 1) * 24 * 60 * 60 * 1000;
        setAskLaterNotifications(askLaterUntil);
        TrueSheet.dismiss(sheetName);
    };

    return (
        <GenericBottomSheet
            allowDismiss={false}
            primaryActionIcon="notifications"
            primaryActionLabel={t('allow_notifications')}
            secondaryActionLabel={t('ask_later')}
            sheetName={sheetName}
            onPrimaryButtonPress={askForNotificationPermission}
            onSecondaryButtonPress={handleAskLater}
        >
            <LottieView autoPlay={true} loop={true} source={planeSource} style={styles.lottie} />
            <Header
                centered
                style={{ marginHorizontal: MARGIN_HORIZONTAL }}
                subtitle={t('turn_on_notifications_desc')}
                title={t('turn_on_notifications_title')}
            />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    lottie: {
        height: 250,
        marginBottom: -10,
        pointerEvents: 'none',
    },
});
