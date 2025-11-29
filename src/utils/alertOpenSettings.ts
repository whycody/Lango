import { Alert } from "react-native";
import { openAppSettings } from "./openAppSettings";
import { t } from "i18next";

export const alertOpenSettings = () => {
  Alert.alert(
    t("notifications_disabled_title"),
    t("notifications_disabled_message"),
    [
      { text: t("cancel"), style: "cancel" },
      { text: t("notifications_open_settings"), onPress: openAppSettings }
    ]
  );
};