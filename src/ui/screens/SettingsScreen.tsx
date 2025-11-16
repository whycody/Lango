import { BackHandler, SectionList, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "../components/CustomText";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import { useLanguage } from "../../store/LanguageContext";
import LibraryItem from "../components/LibraryItem";
import LanguageBottomSheet from "../sheets/LanguageBottomSheet";
import { useEffect, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

type SettingItem = {
  id: number;
  label: string;
  description: string;
  icon: string;
  section: number;
}

enum SettingsItems {
  MAIN_LANGUAGE,
  TRANSLATION_LANGUAGE,
  APPLICATION_LANGUAGE
}

enum SettingsSections {
  LANGUAGE,
}

const SettingsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { languages, mainLang, translationLang, applicationLang } = useLanguage();
  const languageBottomSheetRef = useRef<BottomSheetModal>();
  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);

  const currentMainLang = languages.filter(lang => lang.languageCode === mainLang)[0].languageName;
  const currentTranslationLang = languages.filter(lang => lang.languageCode === translationLang)[0].languageName;
  const currentApplicationLang = languages.filter(lang => lang.languageCode === applicationLang)[0].languageName;

  useEffect(() => {
    const handleBackPress = () => {
      if (bottomSheetIsShown) {
        languageBottomSheetRef.current?.dismiss();
        return true;
      }
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => subscription.remove();
  }, [bottomSheetIsShown]);

  const settingsItems: SettingItem[] = [
    {
      id: SettingsItems.MAIN_LANGUAGE,
      label: t('main_language'),
      description: currentMainLang,
      icon: 'language-sharp',
      section: SettingsSections.LANGUAGE
    },
    {
      id: SettingsItems.TRANSLATION_LANGUAGE,
      label: t('translation_language'),
      description: currentTranslationLang,
      icon: 'language-sharp',
      section: SettingsSections.LANGUAGE
    },
    {
      id: SettingsItems.APPLICATION_LANGUAGE,
      label: t('application_language'),
      description: currentApplicationLang,
      icon: 'language-sharp',
      section: SettingsSections.LANGUAGE
    }
  ];

  const getSectionTitle = (section: number) => {
    switch (section) {
      case SettingsSections.LANGUAGE:
        return t('language');
    }
  }

  const handlePress = (id: number) => {
    switch (id) {
      case SettingsItems.TRANSLATION_LANGUAGE:
      case SettingsItems.APPLICATION_LANGUAGE:
      case SettingsItems.MAIN_LANGUAGE:
        languageBottomSheetRef.current?.present();
        break;
      default:
        break;
    }
  }

  const renderSettingsItem = ({ item, index }) => (
    <LibraryItem
      key={item.id}
      label={item.label}
      icon={item.icon}
      description={item.description}
      onPress={() => handlePress(item.id)}
      style={index !== 0 && { borderTopWidth: 3, borderColor: colors.card }}
      index={0}
    />
  );

  const renderSectionHeader = (title: string) => (
    <CustomText weight='Bold' style={styles.section}>{title}</CustomText>
  );

  const sections = Object.values(SettingsSections)
    .map((section: number) => ({
      title: getSectionTitle(section),
      data: settingsItems.filter((item) => item.section === section)
    }))
    .filter((section) => section.data.length > 0);


  return (
    <>
      <View style={[styles.statusBar, { height: insets.top }]}/>
      <LanguageBottomSheet
        ref={languageBottomSheetRef}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
      />
      <View style={styles.root}>
        <SectionList
          sections={sections}
          ListHeaderComponent={
            <>
              <CustomText weight="Bold" style={styles.title}>{t('settings')}</CustomText>
              <CustomText style={styles.subtitle}>{t('settings_long_desc')}</CustomText>
            </>
          }
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSettingsItem}
          renderSectionHeader={({ section }) => renderSectionHeader(section.title)}
          stickySectionHeadersEnabled={false}
        />
      </View>
    </>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.card,
  },
  statusBar: {
    backgroundColor: colors.card
  },
  title: {
    marginTop: MARGIN_VERTICAL,
    marginHorizontal: MARGIN_HORIZONTAL,
    color: colors.primary,
    fontSize: 24,
  },
  subtitle: {
    color: colors.primary600,
    marginHorizontal: MARGIN_HORIZONTAL,
    marginTop: MARGIN_VERTICAL / 3,
    fontSize: 15
  },
  section: {
    textTransform: 'uppercase',
    color: colors.primary300,
    fontSize: 12,
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: MARGIN_HORIZONTAL
  }
});

export default SettingsScreen;