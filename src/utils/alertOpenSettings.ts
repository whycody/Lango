import { Alert } from "react-native";
import { openAppSettings } from "./openAppSettings";
import { t } from "i18next";

export const alertOpenSettings = (type: 'notifications' | 'microphone') => {
  Alert.alert(
    t(type == 'notifications' ? "notifications_disabled_title" : "microphone.disabled_title"),
    t(type == 'notifications' ? "notifications_disabled_message" : "microphone.disabled_message"),
    [
      { text: t("cancel"), style: "cancel" },
      { text: t("general.open_settings"), onPress: openAppSettings }
    ]
  );
};