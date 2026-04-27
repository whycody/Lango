import { Linking } from 'react-native';

import { isIOS } from './deviceUtils';

export const openAppSettings = () => {
    if (isIOS) {
        Linking.openURL('app-settings:');
    } else {
        Linking.openSettings();
    }
};
