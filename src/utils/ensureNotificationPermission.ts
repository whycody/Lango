import * as Notifications from 'expo-notifications';
import { alertOpenSettings } from "./alertOpenSettings";

export const ensureNotificationsPermission = async (): Promise<boolean> => {
  let { status, canAskAgain } = await Notifications.getPermissionsAsync();

  if (status !== "granted" && canAskAgain) {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
    canAskAgain = req.canAskAgain;
  }

  if (status !== "granted" && !canAskAgain) {
    alertOpenSettings('notifications');
    return false;
  }

  return status === "granted";
};