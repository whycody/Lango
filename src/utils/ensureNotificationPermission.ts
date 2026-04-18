import {
    getPermissionsAsync,
    NotificationPermissionsStatus,
    PermissionStatus,
    requestPermissionsAsync,
} from 'expo-notifications';

import { alertOpenSettings } from './alertOpenSettings';

export const isNotificationPermissionGranted = (permissions: NotificationPermissionsStatus) =>
    permissions.status === PermissionStatus.GRANTED;

export const ensureNotificationsPermission = async (): Promise<boolean> => {
    let { canAskAgain, status } = await getPermissionsAsync();

    if (status !== PermissionStatus.GRANTED && canAskAgain) {
        const req = await requestPermissionsAsync();
        status = req.status;
        canAskAgain = req.canAskAgain;
    }

    if (status !== PermissionStatus.GRANTED && !canAskAgain) {
        alertOpenSettings('notifications');
        return false;
    }

    return status === PermissionStatus.GRANTED;
};
