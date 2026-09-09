import { getMessaging, getToken } from '@react-native-firebase/messaging';

import { usersApi } from '../api/users-api';

export const registerNotificationsToken = async () => {
    const fcmToken = await getToken(getMessaging());
    await usersApi.registerDeviceToken(fcmToken);
};
