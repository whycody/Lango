import React, { forwardRef, useCallback } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, Platform } from "react-native";
import { FullWindowOverlay } from "react-native-screens";
import LanguagePicker from "../components/LanguagePicker";
import { LanguageTypes } from "../../constants/LanguageTypes";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";

type LanguageBottomSheetProps = {
  onChangeIndex?: (index: number) => void;
  languageType?: LanguageTypes
}

const LanguageBottomSheet = forwardRef<BottomSheetModal, LanguageBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const { onChangeIndex, languageType = LanguageTypes.MAIN } = props;
  const { t } = useTranslation();

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const renderContainerComponent = Platform.OS === "ios" ? useCallback(({ children }: any) => (
    <FullWindowOverlay>{children}</FullWindowOverlay>), []) : undefined;

  const handleLanguagePicked = useCallback(() => {
    ref.current?.close();
  }, [ref]);

  return (
    <BottomSheetModal
      ref={ref}
      onChange={(index: number) => onChangeIndex?.(index)}
      containerComponent={renderContainerComponent}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
    >
      <BottomSheetScrollView>
        <LanguagePicker
          languageType={languageType}
          onLanguagePick={handleLanguagePicked}
          style={styles.languagePicker}
        />
        <ActionButton
          onPress={handleLanguagePicked}
          label={t('cancel')}
          primary={true}
          style={styles.button}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  languagePicker: {
    marginBottom: MARGIN_VERTICAL
  },
  button: {
    marginTop: MARGIN_VERTICAL,
    marginHorizontal: MARGIN_HORIZONTAL,
  }
})

export default LanguageBottomSheet;