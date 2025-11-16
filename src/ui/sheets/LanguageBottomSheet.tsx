import React, { forwardRef, useCallback } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { FlatList, Platform, StyleSheet } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import { FullWindowOverlay } from "react-native-screens";
import LanguageItem from "../components/items/LanguageItem";
import * as Haptics from "expo-haptics";
import { Language, LanguageCode } from "../../types";
import { useLanguage } from "../../store/LanguageContext";
import { LanguageTypes } from "../../constants/LanguageTypes";
import { useHaptics } from "../../hooks/useHaptics";

type LanguageBottomSheetProps = {
  onChangeIndex?: (index: number) => void;
  languageType?: LanguageTypes
}

const LanguageBottomSheet = forwardRef<BottomSheetModal, LanguageBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles();
  const { t } = useTranslation();
  const {
    languages,
    mainLang,
    translationLang,
    applicationLang,
    setMainLang,
    setTranslationLang,
    setApplicationLang,
    swapLanguages
  } = useLanguage();
  const { onChangeIndex, languageType = LanguageTypes.MAIN } = props;
  const { triggerHaptics } = useHaptics();

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const renderContainerComponent = Platform.OS === "ios" ? useCallback(({ children }: any) => (
    <FullWindowOverlay>{children}</FullWindowOverlay>), []) : undefined;

  const pickedLanguage = languageType == LanguageTypes.MAIN ? mainLang :
    languageType == LanguageTypes.TRANSLATION ? translationLang : applicationLang;

  const renderLanguageItem = ({ item, index }: { item: Language, index: number }) =>
    <LanguageItem
      language={item}
      index={index}
      checked={item.languageCode == pickedLanguage}
      onPress={() => handleLanguagePick(item)}
    />;

  const handleLanguagePick = (language: Language) => {
    const shouldSwap =
      (languageType === LanguageTypes.MAIN && language.languageCode === translationLang) ||
      (languageType === LanguageTypes.TRANSLATION && language.languageCode === mainLang);

    if (shouldSwap) {
      swapLanguages();
      triggerHaptics(Haptics.ImpactFeedbackStyle.Rigid);
      ref.current?.close();
      return;
    }

    const setters: Record<LanguageTypes, (code: string) => void> = {
      [LanguageTypes.MAIN]: setMainLang,
      [LanguageTypes.TRANSLATION]: setTranslationLang,
      [LanguageTypes.APPLICATION]: setApplicationLang,
    };

    setters[languageType](language.languageCode);

    triggerHaptics(Haptics.ImpactFeedbackStyle.Rigid);
    ref.current?.close();
  };

  const langTypeDesc = languageType == LanguageTypes.MAIN ? 'main' :
    languageType == LanguageTypes.TRANSLATION ? 'translation' : 'application';

  const languagesData = languageType !== LanguageTypes.APPLICATION ? languages :
    languages.filter(lang => [LanguageCode.POLISH, LanguageCode.ENGLISH].includes(lang.languageCode));

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
        <Header
          title={t(`choose_${langTypeDesc}_language`)}
          subtitle={t(`choose_language_desc`)}
          style={styles.header}
        />
        <FlatList
          data={languagesData}
          renderItem={renderLanguageItem}
          scrollEnabled={false}
        />
        <ActionButton
          onPress={() => ref.current?.close()}
          label={t('cancel')}
          primary={true}
          style={styles.button}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const getStyles = () => StyleSheet.create({
  header: {
    paddingVertical: MARGIN_VERTICAL / 2,
    paddingHorizontal: MARGIN_HORIZONTAL,
  },
  button: {
    marginVertical: MARGIN_VERTICAL,
    marginHorizontal: MARGIN_HORIZONTAL,
  }
});

export default LanguageBottomSheet;