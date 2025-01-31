import React, { forwardRef, useCallback } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomText from "../components/CustomText";
import { Platform, StyleSheet } from "react-native";
import ActionButton from "../components/ActionButton";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import Header from "../components/Header";
import { FullWindowOverlay } from "react-native-screens";

type AcceptationBottomSheetProps = {
  title: string;
  description: string;
  onAccept: () => void;
  onCancel: () => void;
}

const AcceptationBottomSheet = forwardRef<BottomSheetModal, AcceptationBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const renderContainerComponent = Platform.OS === "ios" ? useCallback(({ children }: any) => (
    <FullWindowOverlay>{children}</FullWindowOverlay>), []) : undefined;

  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={renderBackdrop}
      containerComponent={renderContainerComponent}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
    >
      <BottomSheetView style={styles.root}>
        <Header title={props.title} subtitle={props.description} style={styles.header}/>
        <ActionButton
          onPress={props.onAccept}
          label={t('continue')}
          primary={true}
          style={styles.button}
        />
        <CustomText
          style={styles.actionText}
          weight={'SemiBold'}
          onPress={props.onCancel}
        >
          {t('cancel')}
        </CustomText>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: MARGIN_HORIZONTAL,
  },
  header: {
    paddingVertical: MARGIN_VERTICAL / 2,
  },
  button: {
    marginTop: MARGIN_VERTICAL
  },
  actionText: {
    color: colors.primary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: MARGIN_VERTICAL
  },
});

export default AcceptationBottomSheet;