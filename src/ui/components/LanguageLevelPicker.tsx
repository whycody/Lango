import React, { FC } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Header } from "../components";
import { LanguageItem, LanguageLevelItem } from "../components/items";
import { useTranslation } from "react-i18next";
import { LANGUAGE_LEVEL_KEYS } from "../../constants/LanguageLevels";
import { useLanguage } from "../../store";
import { useAuth } from "../../api/auth/AuthProvider";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import { Language, LanguageLevelRange } from "../../types";
import { useHaptics } from "../../hooks/useHaptics";
import { ImpactFeedbackStyle } from "expo-haptics";

type LanguageLevelPickerProps = {
  language?: Language;
  pickedLevel?: LanguageLevelRange;
  onLevelPick?: (level: LanguageLevelRange) => void;
  updateUserData?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const LanguageLevelPicker: FC<LanguageLevelPickerProps> = ({
  language,
  pickedLevel,
  onLevelPick,
  updateUserData = true,
  style,
}) => {
  const { t } = useTranslation();
  const { setMainLang } = useLanguage();
  const { updateUserLanguageLevels } = useAuth();
  const haptics = useHaptics();

  const languageLevels = LANGUAGE_LEVEL_KEYS.map((l) => ({
    level: l.level,
    code: l.code,
    label: t(`language_level.${l.key}`),
    desc: t(`language_level.${l.key}_desc`),
  }));

  const handleLanguageLevelPress = (level: LanguageLevelRange) => {
    onLevelPick?.(level);
    haptics.triggerHaptics(ImpactFeedbackStyle.Rigid);
    if (!updateUserData) return;
    updateUserLanguageLevels({ language: language.languageCode, level });
    setMainLang(language.languageCode);
  };

  return (
    <View style={style}>
      <Header
        title={t("language_level.select", {
          language: language?.languageName.toLowerCase(),
        })}
        subtitle={t("language_level.select_desc")}
        style={styles.header}
      />
      {language && (
        <LanguageItem
          index={0}
          showIcon={false}
          checked={false}
          language={language}
        />
      )}
      {languageLevels.map(({ level, label, code, desc }) => (
        <LanguageLevelItem
          key={level}
          level={level}
          code={code}
          label={label}
          desc={desc}
          picked={level == pickedLevel}
          onPress={handleLanguageLevelPress}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: MARGIN_VERTICAL / 2,
    paddingHorizontal: MARGIN_HORIZONTAL,
  },
});
