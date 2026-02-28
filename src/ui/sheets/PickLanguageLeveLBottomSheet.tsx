import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { GenericBottomSheet } from "./GenericBottomSheet";
import { LANGUAGE_LEVEL_KEYS } from "../../constants/LanguageLevels";
import LanguageItem from "../components/items/LanguageItem";
import { Language, LanguageLevelRange } from "../../types";
import LanguageLevelItem from "../components/items/LanguageLevelItem";
import { useLanguage } from "../../store/LanguageContext";
import { MARGIN_VERTICAL } from "../../constants/margins";
import { useAuth } from "../../api/auth/AuthProvider";

export const PickLanguageLeveLBottomSheet = forwardRef<BottomSheetModal, {
  language?: Language,
  onChangeIndex?: (index: number) => void
}>((props, ref) => {
  const { t } = useTranslation();
  const { setMainLang } = useLanguage();
  const { updateUserLanguageLevels } = useAuth();

  const languageLevels = LANGUAGE_LEVEL_KEYS.map(l => ({
    level: l.level,
    code: l.code,
    label: t(`language_level.${l.key}`),
    desc: t(`language_level.${l.key}_desc`)
  }));

  const handleChangeIndex = (index?: number) => {
    if (props.onChangeIndex) props.onChangeIndex(index);
  };

  const dismiss = () => {
    ref && typeof ref !== 'function' && ref.current?.dismiss();
  }

  const handleLanguageLevelPress = (level: LanguageLevelRange) => {
    updateUserLanguageLevels({ language: props.language.languageCode, level });
    setMainLang(props.language.languageCode);
    dismiss();
  }

  return (
    <GenericBottomSheet
      ref={ref}
      title={t('language_level.select', { language: props.language?.languageName.toLowerCase() })}
      description={t('language_level.select_desc')}
      primaryActionLabel={t('general.cancel')}
      onPrimaryButtonPress={dismiss}
      onChangeIndex={handleChangeIndex}
    >
      {props.language &&
        <LanguageItem
          index={0}
          showIcon={false}
          checked={false}
          language={props.language}
          style={styles.languageItem}
        />
      }
      {languageLevels.map(({ level, label, code, desc }) => (
        <LanguageLevelItem
          key={level}
          level={level}
          code={code}
          label={label}
          desc={desc}
          onPress={handleLanguageLevelPress}
        />
      ))}
    </GenericBottomSheet>
  );
});

const styles = StyleSheet.create({
  languageItem: {
    marginVertical: MARGIN_VERTICAL / 2
  }
})
