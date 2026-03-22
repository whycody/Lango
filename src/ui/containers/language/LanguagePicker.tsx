import React, { useCallback } from "react";
import { FlatList, StyleSheet, View, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { Language } from "../../../types";
import { LanguageCode } from "../../../constants/Language";
import { useLanguage } from "../../../store";
import { useHaptics } from "../../../hooks";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../../constants/margins";
import { Header } from "../../components";
import { LanguageItem } from "../../components/language";
import { useAuth } from "../../../api/auth/AuthProvider";
import { LanguageTypes } from "../../../constants/Language";

interface LanguagePickerProps {
  allLanguages?: boolean;
  languageType?: LanguageTypes;
  onLanguagePick?: (
    language: Language,
    userEvaluatedLanguageLevel: boolean,
  ) => void;
  alwaysAllowPick?: boolean;
  style?: ViewStyle;
}

export const LanguagePicker = (props: LanguagePickerProps) => {
  const {
    languageType = LanguageTypes.MAIN,
    onLanguagePick,
    alwaysAllowPick,
    style,
  } = props;
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
  } = useLanguage();
  const { user } = useAuth();
  const { triggerHaptics } = useHaptics();

  const pickedLanguage =
    languageType === LanguageTypes.MAIN
      ? mainLang
      : languageType === LanguageTypes.TRANSLATION
        ? translationLang
        : applicationLang;

  const langTypeDesc =
    languageType === LanguageTypes.MAIN
      ? "main"
      : languageType === LanguageTypes.TRANSLATION
        ? "translation"
        : "application";

  const languagesData =
    languageType !== LanguageTypes.APPLICATION
      ? languages
      : languages.filter((lang) =>
          [LanguageCode.POLISH, LanguageCode.ENGLISH].includes(
            lang.languageCode,
          ),
        );

  const handleLanguagePick = useCallback(
    (language: Language) => {
      const setters: Record<LanguageTypes, (code: string) => void> = {
        [LanguageTypes.MAIN]: setMainLang,
        [LanguageTypes.TRANSLATION]: setTranslationLang,
        [LanguageTypes.APPLICATION]: setApplicationLang,
      };

      const userEvaluatedLanguageLevel =
        (languageType === LanguageTypes.MAIN &&
          translationLang == language.languageCode) ||
        user.languageLevels?.some(
          (level) => level.language == language.languageCode,
        );

      if (
        languageType !== LanguageTypes.MAIN ||
        userEvaluatedLanguageLevel ||
        alwaysAllowPick
      ) {
        setters[languageType](language.languageCode);
      }

      triggerHaptics(Haptics.ImpactFeedbackStyle.Rigid);
      onLanguagePick?.(language, userEvaluatedLanguageLevel);
    },
    [
      languageType,
      translationLang,
      mainLang,
      setMainLang,
      setTranslationLang,
      setApplicationLang,
      triggerHaptics,
      onLanguagePick,
    ],
  );

  const renderLanguageItem = useCallback(
    ({ item, index }: { item: Language; index: number }) => (
      <LanguageItem
        language={item}
        index={index}
        checked={item.languageCode === pickedLanguage}
        onPress={() => handleLanguagePick(item)}
      />
    ),
    [pickedLanguage, handleLanguagePick],
  );

  return (
    <View style={style}>
      <Header
        title={t(`choose_${langTypeDesc}_language`)}
        subtitle={t(`choose_language_${languageType}_desc`)}
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

const getStyles = () =>
  StyleSheet.create({
    header: {
      paddingVertical: MARGIN_VERTICAL / 2,
      paddingHorizontal: MARGIN_HORIZONTAL,
    },
  });
