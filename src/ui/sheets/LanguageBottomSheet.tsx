import React, { forwardRef, useCallback } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { Platform } from "react-native";
import { FullWindowOverlay } from "react-native-screens";
import LanguagePicker from "../components/LanguagePicker";
import { LanguageTypes } from "../../constants/LanguageTypes";

type LanguageBottomSheetProps = {
  onChangeIndex?: (index: number) => void;
  languageType?: LanguageTypes
}

const LanguageBottomSheet = forwardRef<BottomSheetModal, LanguageBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const { onChangeIndex, languageType = LanguageTypes.MAIN } = props;

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
          onLanguagePicked={handleLanguagePicked}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});


export default LanguageBottomSheet;