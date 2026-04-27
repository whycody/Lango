import messaging from '@react-native-firebase/messaging';

import { registerDeviceToken } from '../api/apiClient';

export const registerNotificationsToken = async () => {
    const fcmToken = await messaging().getToken();
    await registerDeviceToken(fcmToken);
};
