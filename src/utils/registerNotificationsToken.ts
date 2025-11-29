import * as Notifications from "expo-notifications";
import { registerDeviceToken } from "../api/apiClient";

export const registerNotificationsToken = async () => {
  const tokenData = await Notifications.getDevicePushTokenAsync();
  const pushToken = tokenData.data;
  await registerDeviceToken(pushToken);
}