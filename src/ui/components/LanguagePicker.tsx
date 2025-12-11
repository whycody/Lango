import React, { useCallback } from "react";
import { FlatList, StyleSheet, View, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { Language, LanguageCode } from "../../types";
import { useLanguage } from "../../store/LanguageContext";
import { LanguageTypes } from "../../constants/LanguageTypes";
import { useHaptics } from "../../hooks/useHaptics";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import Header from "./Header";
import LanguageItem from "./items/LanguageItem";

interface LanguagePickerProps {
  languageType?: LanguageTypes;
  onLanguagePick?: () => void;
  style?: ViewStyle;
}

const LanguagePicker = ({ languageType = LanguageTypes.MAIN, onLanguagePick, style }: LanguagePickerProps) => {
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
  const { triggerHaptics } = useHaptics();

  const pickedLanguage = languageType === LanguageTypes.MAIN ? mainLang :
    languageType === LanguageTypes.TRANSLATION ? translationLang : applicationLang;

  const langTypeDesc = languageType === LanguageTypes.MAIN ? 'main' :
    languageType === LanguageTypes.TRANSLATION ? 'translation' : 'application';

  const languagesData = languageType !== LanguageTypes.APPLICATION ? languages :
    languages.filter(lang => [LanguageCode.POLISH, LanguageCode.ENGLISH].includes(lang.languageCode));

  const handleLanguagePick = useCallback((language: Language) => {
    const shouldSwap =
      (languageType === LanguageTypes.MAIN && language.languageCode === translationLang) ||
      (languageType === LanguageTypes.TRANSLATION && language.languageCode === mainLang);

    if (shouldSwap) {
      swapLanguages();
      triggerHaptics(Haptics.ImpactFeedbackStyle.Rigid);
      onLanguagePick?.();
      return;
    }

    const setters: Record<LanguageTypes, (code: string) => void> = {
      [LanguageTypes.MAIN]: setMainLang,
      [LanguageTypes.TRANSLATION]: setTranslationLang,
      [LanguageTypes.APPLICATION]: setApplicationLang,
    };

    setters[languageType](language.languageCode);

    triggerHaptics(Haptics.ImpactFeedbackStyle.Rigid);
    onLanguagePick?.();
  }, [languageType, translationLang, mainLang, swapLanguages, setMainLang, setTranslationLang, setApplicationLang, triggerHaptics, onLanguagePick]);

  const renderLanguageItem = useCallback(({ item, index }: { item: Language, index: number }) =>
    <LanguageItem
      language={item}
      index={index}
      checked={item.languageCode === pickedLanguage}
      onPress={() => handleLanguagePick(item)}
    />, [pickedLanguage, handleLanguagePick]);

  return (
    <View style={style}>
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
    </View>
  );
};

const getStyles = () => StyleSheet.create({
  header: {
    paddingVertical: MARGIN_VERTICAL,
    paddingHorizontal: MARGIN_HORIZONTAL,
  },
});

export default LanguagePicker;