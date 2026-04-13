import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { alertOpenSettings } from './alertOpenSettings';

const IOS_GRANTED_STATUSES = new Set([
    Notifications.IosAuthorizationStatus.AUTHORIZED,
    Notifications.IosAuthorizationStatus.PROVISIONAL,
    Notifications.IosAuthorizationStatus.EPHEMERAL,
]);

export const isNotificationPermissionGranted = (
    permissions: Notifications.NotificationPermissionsStatus,
) => {
    if (Platform.OS === 'ios') {
        const iosStatus =
            permissions.ios?.status ?? Notifications.IosAuthorizationStatus.NOT_DETERMINED;
        return IOS_GRANTED_STATUSES.has(iosStatus);
    }

    return (permissions.android?.importance ?? 0) > 0;
};

export const ensureNotificationsPermission = async (): Promise<boolean> => {
    let permissions = await Notifications.getPermissionsAsync();

    if (!isNotificationPermissionGranted(permissions)) {
        permissions = await Notifications.requestPermissionsAsync();
    }

    if (!isNotificationPermissionGranted(permissions)) {
        alertOpenSettings('notifications');
        return false;
    }

    return true;
};
