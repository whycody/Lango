import React from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { useUserPreferences } from '../../store';
import { trackEvent } from '../../utils/analytics';
import { ensureNotificationsPermission } from '../../utils/ensureNotificationPermission';
import { registerNotificationsToken } from '../../utils/registerNotificationsToken';
import { GenericBottomSheet } from './GenericBottomSheet';

type EnableNotificationsBottomSheetProps = {
    sheetName: string;
};

export const EnableNotificationsBottomSheet = (props: EnableNotificationsBottomSheetProps) => {
    const { sheetName } = props;
    const { t } = useTranslation();
    const { setAskLaterNotifications } = useUserPreferences();

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
