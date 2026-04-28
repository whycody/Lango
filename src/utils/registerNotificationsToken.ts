import { getMessaging, getToken } from '@react-native-firebase/messaging';

import { registerDeviceToken } from '../api/apiClient';

export const registerNotificationsToken = async () => {
    const fcmToken = await getToken(getMessaging());
    await registerDeviceToken(fcmToken);
};
