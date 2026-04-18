import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { useUserPreferences } from '../../store';
import { trackEvent } from '../../utils/analytics';
import {
    ensureNotificationsPermission,
    isNotificationPermissionGranted,
} from '../../utils/ensureNotificationPermission';
import { registerNotificationsToken } from '../../utils/registerNotificationsToken';
import { GenericBottomSheet } from './GenericBottomSheet';

type EnableNotificationsBottomSheetProps = {
    sheetName: string;
};

export const EnableNotificationsBottomSheet = (props: EnableNotificationsBottomSheetProps) => {
    const { sheetName } = props;
    const { t } = useTranslation();
    const { setAskLaterNotifications } = useUserPreferences();
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
        const askLaterUntil = Date.now() + 48 * 60 * 60 * 1000;
        setAskLaterNotifications(askLaterUntil);
        TrueSheet.dismiss(sheetName);
    };

    return (
        <GenericBottomSheet
            description={t('turn_on_notifications_desc')}
            primaryActionLabel={t('allow_notifications')}
            secondaryActionLabel={t('ask_later')}
            sheetName={sheetName}
            title={t('turn_on_notifications_title')}
            onPrimaryButtonPress={askForNotificationPermission}
            onSecondaryButtonPress={handleAskLater}
        />
    );
};
