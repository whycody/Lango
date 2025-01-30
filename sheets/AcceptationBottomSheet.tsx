import React, { forwardRef, useCallback } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomText from "../components/CustomText";
import { StyleSheet } from "react-native";
import ActionButton from "../components/ActionButton";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import Header from "../components/Header";

type AcceptationBottomSheetProps = {
  title: string;
  description: string;
  onAccept: () => void;
}

const AcceptationBottomSheet = forwardRef<BottomSheetModal, AcceptationBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
    >
      <BottomSheetScrollView style={styles.root}>
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