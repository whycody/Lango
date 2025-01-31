import React, { forwardRef, useCallback } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { FlatList, Platform, StyleSheet } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import { FullWindowOverlay } from "react-native-screens";
import LanguageItem from "../components/LanguageItem";

export type Language = {
  languageCode: string;
  languageName: string;
  languageInTargetLanguage: string;
}

export enum LanguageCode {
  ENGLISH = 'eng',
  SPANISH = 'es',
  ITALIAN = 'it',
}

const LanguageBottomSheet = forwardRef<BottomSheetModal>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles();
  const { t } = useTranslation();

  const languages: Language[] = [
    { languageCode: LanguageCode.ENGLISH, languageName: t('english'), languageInTargetLanguage: 'English' },
    { languageCode: LanguageCode.SPANISH, languageName: t('spanish'), languageInTargetLanguage: 'Español' },
    { languageCode: LanguageCode.ITALIAN, languageName: t('italian'), languageInTargetLanguage: 'Italiano' },
  ];

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const renderContainerComponent = Platform.OS === "ios" ? useCallback(({ children }: any) => (
    <FullWindowOverlay>{children}</FullWindowOverlay>), []) : undefined;

  const renderLanguageItem = ({ item, index }: { item: Language, index: number }) =>
    <LanguageItem language={item} index={index} onPress={() => ref.current?.close()}/>;

  return (
    <BottomSheetModal
      ref={ref}
      containerComponent={renderContainerComponent}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
    >
      <BottomSheetScrollView>
        <Header title={t('chooseLanguage')} subtitle={t('chooseLanguageDesc')} style={styles.header}/>
        <FlatList data={languages} renderItem={renderLanguageItem} scrollEnabled={false}/>
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