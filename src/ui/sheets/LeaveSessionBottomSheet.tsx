import React, { forwardRef, useCallback } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import CustomText from "../components/CustomText";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";

type FinishSessionBottomSheetProps = {
  leaveSession: () => void;
  onChangeIndex?: (index: number) => void;
}

export const LeaveSessionBottomSheet = forwardRef<BottomSheetModal, FinishSessionBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      onChange={(index: number) => props.onChangeIndex?.(index)}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
    >
      <BottomSheetScrollView style={styles.root}>
        <CustomText weight={"Bold"} style={styles.title}>{t('finishingSession')}</CustomText>
        <CustomText style={styles.subtitle}>{t('finishingSessionDesc')}</CustomText>

        <ActionButton
          onPress={props.leaveSession}
          label={t('finish')}
          primary={true}
          style={styles.button}
        />
        <CustomText
          style={styles.actionText}
          weight={'SemiBold'}
          onPress={() => ref.current?.dismiss()}
        >
          {t('cancel')}
        </CustomText>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    paddingHorizontal: MARGIN_HORIZONTAL,
  },
  header: {
    paddingTop: MARGIN_VERTICAL,
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
