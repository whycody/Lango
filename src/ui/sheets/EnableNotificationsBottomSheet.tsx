import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { BOTTOM_SHEET_GRABBER_OPTIONS } from '../../constants/Common';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { useUserPreferences } from '../../store';
import { trackEvent } from '../../utils/analytics';
import { ensureNotificationsPermission } from '../../utils/ensureNotificationPermission';
import { registerNotificationsToken } from '../../utils/registerNotificationsToken';
import { ActionButton, CustomText } from '../components/';
import { CustomTheme } from '../Theme';

type EnableNotificationsBottomSheetProps = {
    sheetName: string;
};

export const EnableNotificationsBottomSheet = (props: EnableNotificationsBottomSheetProps) => {
    const { sheetName } = props;
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);
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
        <TrueSheet
            backgroundColor={colors.card}
            cornerRadius={24}
            detents={['auto']}
            dimmed={true}
            grabberOptions={BOTTOM_SHEET_GRABBER_OPTIONS}
            name={sheetName}
        >
            <View style={styles.root}>
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
