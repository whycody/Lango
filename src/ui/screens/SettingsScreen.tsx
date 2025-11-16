import { BackHandler, SectionList, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "../components/CustomText";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import { useLanguage } from "../../store/LanguageContext";
import LibraryItem from "../components/LibraryItem";
import LanguageBottomSheet from "../sheets/LanguageBottomSheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { SettingItem } from "../../types";
import { SettingsItems } from "../../constants/SettingsItems";
import VersionFooter from "../components/VersionFooter";
import { SettingsSections } from "../../constants/SettingsSections";
import { LanguageTypes } from "../../constants/LanguageTypes";
import { useUserPreferences } from "../../store/UserPreferencesContext";

const SettingsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { languages, mainLang, translationLang, applicationLang } = useLanguage();
  const languageBottomSheetRef = useRef<BottomSheetModal>();
  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);
  const userPreferences = useUserPreferences();

  const currentMainLang = languages.filter(lang => lang.languageCode === mainLang)[0].languageName;
  const currentTranslationLang = languages.filter(lang => lang.languageCode === translationLang)[0].languageName;
  const currentApplicationLang = languages.filter(lang => lang.languageCode === applicationLang)[0].languageName;

  const [pickedLanguageType, setPickedLanguageType] = useState<LanguageTypes>(LanguageTypes.MAIN);

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

  const settingsItems: SettingItem[] = useMemo(() => [
    {
      id: SettingsItems.MAIN_LANGUAGE,
      label: t('main_language'),
      description: currentMainLang,
      icon: 'language-sharp',
      section: SettingsSections.LANGUAGE,
    },
    {
      id: SettingsItems.TRANSLATION_LANGUAGE,
      label: t('translation_language'),
      description: currentTranslationLang,
      icon: 'language-sharp',
      section: SettingsSections.LANGUAGE,
    },
    {
      id: SettingsItems.APPLICATION_LANGUAGE,
      label: t('application_language'),
      description: currentApplicationLang,
      icon: 'language-sharp',
      section: SettingsSections.LANGUAGE,
    },
    {
      id: SettingsItems.VIBRATIONS,
      label: t('vibrations'),
      description: t(`turned_${userPreferences.vibrationsEnabled ? 'on' : 'off'}_m`),
      icon: 'phone-portrait-sharp',
      enabled: userPreferences.vibrationsEnabled,
      section: SettingsSections.PREFERENCES,
    },
    {
      id: SettingsItems.NOTIFICATIONS,
      label: t('notifications'),
      description: t(`turned_${userPreferences.notificationsEnabled ? 'on' : 'off'}_m`),
      icon: 'notifications-sharp',
      enabled: userPreferences.notificationsEnabled,
      section: SettingsSections.PREFERENCES,
    }
  ], [t, userPreferences, currentMainLang, currentTranslationLang, currentApplicationLang]);

  const getSectionTitle = (section: number) => {
    switch (section) {
      case SettingsSections.LANGUAGE:
        return t('language');
      case SettingsSections.PREFERENCES:
        return t('preferences');
      case SettingsSections.SESSION:
        return t('session');
      default:
        return '';
    }
  }

  const mapSettingsToLanguageType = (id: SettingsItems): LanguageTypes => {
    switch (id) {
      case SettingsItems.MAIN_LANGUAGE:
        return LanguageTypes.MAIN;
      case SettingsItems.TRANSLATION_LANGUAGE:
        return LanguageTypes.TRANSLATION;
      case SettingsItems.APPLICATION_LANGUAGE:
        return LanguageTypes.APPLICATION;
    }
  }

  const handlePress = useCallback((id: SettingsItems) => {
    switch (id) {
      case SettingsItems.TRANSLATION_LANGUAGE:
      case SettingsItems.APPLICATION_LANGUAGE:
      case SettingsItems.MAIN_LANGUAGE:
        setPickedLanguageType(mapSettingsToLanguageType(id));
        languageBottomSheetRef.current?.present();
        break;
      case SettingsItems.VIBRATIONS:
        userPreferences.setVibrationsEnabled(!userPreferences.vibrationsEnabled);
        break;
      case SettingsItems.NOTIFICATIONS:
        userPreferences.setNotificationsEnabled(!userPreferences.notificationsEnabled);
        break;
      default:
        break;
    }
  }, [userPreferences, languageBottomSheetRef]);

  const renderSettingsItem = ({ item, index }) => (
    <LibraryItem
      key={item.id}
      label={item.label}
      icon={item.icon}
      description={item.description}
      onPress={() => handlePress(item.id)}
      style={index !== 0 && { borderTopWidth: 3, borderColor: colors.card }}
      enabled={item.enabled}
      index={0}
    />
  );

  const renderSectionHeader = (title: string) => (
    <CustomText weight='Bold' style={styles.section}>{title}</CustomText>
  );

  const sections = useMemo(() => {
    return Object.values(SettingsSections)
      .map((section: number) => ({
        title: getSectionTitle(section),
        data: settingsItems.filter(item => item.section === section)
      }))
      .filter(section => section.data.length > 0);
  }, [settingsItems, t]);

  return (
    <>
      <View style={[styles.statusBar, { height: insets.top }]}/>
      <LanguageBottomSheet
        ref={languageBottomSheetRef}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
        languageType={pickedLanguageType}
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
          ListFooterComponent={<VersionFooter/>}
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
    color: colors.primary,
    fontSize: 13,
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: MARGIN_HORIZONTAL
  }
});

export default SettingsScreen;