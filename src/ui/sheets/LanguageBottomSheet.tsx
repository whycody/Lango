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
import { Language } from "../../types";
import { useLanguage } from "../../store/LanguageContext";

type LanguageBottomSheetProps = {
  onChangeIndex?: (index: number) => void;
}

const LanguageBottomSheet = forwardRef<BottomSheetModal, LanguageBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles();
  const { t } = useTranslation();
  const languageContext = useLanguage();

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const renderContainerComponent = Platform.OS === "ios" ? useCallback(({ children }: any) => (
    <FullWindowOverlay>{children}</FullWindowOverlay>), []) : undefined;

  const renderLanguageItem = ({ item, index }: { item: Language, index: number }) =>
    <LanguageItem
      language={item}
      index={index}
      checked={item.languageCode == languageContext.mainLang}
      onPress={() => handleLanguagePick(item)}
    />;

  const handleLanguagePick = (language: Language) => {
    languageContext.setMainLang(language.languageCode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    ref.current?.close();
  }

  return (
    <BottomSheetModal
      ref={ref}
      onChange={(index: number) => props.onChangeIndex?.(index)}
      containerComponent={renderContainerComponent}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
    >
      <BottomSheetScrollView>
        <Header title={t('chooseLanguage')} subtitle={t('chooseLanguageDesc')} style={styles.header}/>
        <FlatList data={languageContext.languages} renderItem={renderLanguageItem} scrollEnabled={false}/>
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