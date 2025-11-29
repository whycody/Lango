import React, { forwardRef, useCallback } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, Platform } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import CustomText from "../components/CustomText";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";
import * as Notifications from 'expo-notifications';

type EnableNotificationsBottomSheetProps = {
  onChangeIndex?: (index: number) => void;
}

const EnableNotificationsBottomSheet = forwardRef<BottomSheetModal, EnableNotificationsBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const askForNotificationPermission = async () => {
    let status;
    if (Platform.OS === 'ios') {
      const settings = await Notifications.getPermissionsAsync();
      status = settings.status;
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        status = newStatus;
      }
    } else {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      status = existingStatus;
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        status = newStatus;
      }
    }
    if (status === 'granted') {
      // Możesz tutaj dodać logikę po uzyskaniu zgody
    }
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
          onPress={() => ref && (ref as React.RefObject<BottomSheetModal>).current?.dismiss()}
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
    marginTop: MARGIN_VERTICAL,
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