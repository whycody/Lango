import { Alert } from 'react-native';
import { t } from 'i18next';

import { openAppSettings } from './openAppSettings';

export const alertOpenSettings = (type: 'notifications' | 'microphone') => {
    Alert.alert(
        t(type == 'notifications' ? 'notifications_disabled_title' : 'microphone.disabled_title'),
        t(
            type == 'notifications'
                ? 'notifications_disabled_message'
                : 'microphone.disabled_message',
        ),
        [
            { style: 'cancel', text: t('cancel') },
            { onPress: openAppSettings, text: t('general.open_settings') },
        ],
    );
};
