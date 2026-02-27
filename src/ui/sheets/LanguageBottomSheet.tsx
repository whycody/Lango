import React, { forwardRef, useCallback, useState } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { Platform, StyleSheet } from "react-native";
import { FullWindowOverlay } from "react-native-screens";
import LanguagePicker from "../components/LanguagePicker";
import { LanguageTypes } from "../../constants/LanguageTypes";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";
import { PickLanguageLeveLBottomSheet } from "./PickLanguageLeveLBottomSheet";
import { Language } from "../../types";

type LanguageBottomSheetProps = {
  onChangeIndex?: (index: number) => void;
  allLanguages?: boolean;
  languageType?: LanguageTypes
}

export const LanguageBottomSheet = forwardRef<BottomSheetModal, LanguageBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const { onChangeIndex, allLanguages, languageType = LanguageTypes.MAIN } = props;
  const [pickedLanguage, setPickedLanguage] = useState<Language | null>(null);
  const pickLanguageLevelBottomSheetRef = React.useRef<BottomSheetModal>(null);
  const { t } = useTranslation();

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const renderContainerComponent = Platform.OS === "ios" ? useCallback(({ children }: any) => (
    <FullWindowOverlay>{children}</FullWindowOverlay>), []) : undefined;

  const dismiss = () => {
    ref && typeof ref !== 'function' && ref.current?.dismiss();
  }

  const handleLanguagePicked = useCallback((language: Language, userEvaluatedLanguageLevel: boolean) => {
    dismiss();
    if (userEvaluatedLanguageLevel || languageType !== LanguageTypes.MAIN) return;
    setPickedLanguage(language);
    pickLanguageLevelBottomSheetRef.current?.present();
  }, [ref]);

  return (
    <>
      <PickLanguageLeveLBottomSheet ref={pickLanguageLevelBottomSheetRef} language={pickedLanguage}/>
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
            allLanguages={allLanguages}
            languageType={languageType}
            onLanguagePick={handleLanguagePicked}
            style={styles.languagePicker}
          />
          <ActionButton
            onPress={dismiss}
            label={t('cancel')}
            primary={true}
            style={styles.button}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
});

const styles = StyleSheet.create({
  languagePicker: {
    marginBottom: MARGIN_VERTICAL
  },
  button: {
    marginBottom: MARGIN_VERTICAL,
    marginTop: MARGIN_VERTICAL / 2,
    marginHorizontal: MARGIN_HORIZONTAL,
  }
})
