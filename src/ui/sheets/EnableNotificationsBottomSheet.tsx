import React, { forwardRef, useCallback } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import CustomText from "../components/CustomText";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";
import { useUserPreferences } from "../../store/UserPreferencesContext";
import { registerNotificationsToken } from "../../utils/registerNotificationsToken";
import { ensureNotificationsPermission } from "../../utils/ensureNotificationPermission";
import { trackEvent } from "../../utils/analytics";
import { AnalyticsEventName } from "../../constants/AnalyticsEventName";

type EnableNotificationsBottomSheetProps = {
  onChangeIndex?: (index: number) => void;
}

const EnableNotificationsBottomSheet = forwardRef<BottomSheetModal, EnableNotificationsBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const { setAskLaterNotifications } = useUserPreferences();

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const askForNotificationPermission = async () => {
    const granted = await ensureNotificationsPermission();

    if (!granted) {
      trackEvent(AnalyticsEventName.NOTIFICATIONS_ENABLE_FAILURE, { reason: 'Permissions not granted' });
      return;
    }

    trackEvent(AnalyticsEventName.NOTIFICATIONS_ENABLE_SUCCESS)
    await registerNotificationsToken();
    ref.current?.dismiss();
  };

  const handleAskLater = () => {
    const askLaterUntil = Date.now() + 48 * 60 * 60 * 1000;
    setAskLaterNotifications(askLaterUntil);
    ref.current?.dismiss();
  }

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      onChange={(index: number) => props.onChangeIndex?.(index)}
      enablePanDownToClose={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
    >
      <BottomSheetScrollView style={styles.root}>
        <CustomText weight={"Bold"} style={styles.title}>{t('turn_on_notifications_title')}</CustomText>
        <CustomText style={styles.subtitle}>{t('turn_on_notifications_desc')}</CustomText>

        <ActionButton
          onPress={askForNotificationPermission}
          label={t('allow_notifications')}
          primary={true}
          style={styles.button}
        />
        <CustomText
          style={styles.actionText}
          weight={'SemiBold'}
          onPress={handleAskLater}
        >
          {t('ask_later')}
        </CustomText>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    paddingHorizontal: MARGIN_HORIZONTAL,
  },
  title: {
    color: colors.primary300,
    fontSize: 18,
    marginTop: 12,
  },
  subtitle: {
    color: colors.primary600,
    fontSize: 15,
    marginTop: MARGIN_VERTICAL / 2,
  },
  actionText: {
    color: colors.primary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: MARGIN_VERTICAL
  },
  button: {
    marginTop: MARGIN_VERTICAL
  }
});

export default EnableNotificationsBottomSheet;