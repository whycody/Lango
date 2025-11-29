import { BackHandler, SectionList, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "../components/CustomText";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import { useLanguage } from "../../store/LanguageContext";
import LibraryItem from "../components/items/LibraryItem";
import LanguageBottomSheet from "../sheets/LanguageBottomSheet";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { SettingItem } from "../../types";
import { SettingsItems } from "../../constants/SettingsItems";
import VersionFooter from "../components/VersionFooter";
import { SettingsSections } from "../../constants/SettingsSections";
import { LanguageTypes } from "../../constants/LanguageTypes";
import { FLASHCARD_SIDE, useUserPreferences } from "../../store/UserPreferencesContext";
import { useDynamicStatusBar } from "../../hooks/useDynamicStatusBar";
import * as Notifications from "expo-notifications";
import { registerNotificationsToken } from "../../utils/registerNotificationsToken";
import { updateNotificationsEnabled } from "../../api/apiClient";
import { ensureNotificationsPermission } from "../../utils/ensureNotificationPermission";

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

  const [notificationsStatus, setNotificationsStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [pickedLanguageType, setPickedLanguageType] = useState<LanguageTypes>(LanguageTypes.MAIN);
  const { style, onScroll } = useDynamicStatusBar(100, 0.5);
  const notificationsEnabled = notificationsStatus == 'granted' && userPreferences.notificationsEnabled;

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

  useLayoutEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsStatus(status);
    }

    checkPermissions();
  }, []);

  const checkNotifications = async () => {
    const granted = await ensureNotificationsPermission();
    if (!granted) return;

    setNotificationsStatus('granted');
    await registerNotificationsToken();
    const update = await updateNotificationsEnabled(true);
    if (!update) return;
    userPreferences.setNotificationsEnabled(true);
  };

  const handleNotificationsSettingItemPress = async () => {
    if (!notificationsEnabled) {
      await checkNotifications();
    } else {
      const update = await updateNotificationsEnabled(false);
      if (!!update) userPreferences.setNotificationsEnabled(!userPreferences.notificationsEnabled);
    }
  }

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
      enabled: notificationsEnabled,
      section: SettingsSections.PREFERENCES,
    },
    {
      id: SettingsItems.FLASHCARD_SIDE,
      label: t('flashcard_side'),
      description: userPreferences.flashcardSide == FLASHCARD_SIDE.WORD ? t('word') : t('translation'),
      icon: 'document-text-sharp',
      section: SettingsSections.SESSION,
    },
    {
      id: SettingsItems.SESSION_SPEECH_SYNTHESIZER,
      label: t('speech_synthesizer'),
      description: t(`turned_${userPreferences.sessionSpeechSynthesizer ? 'on' : 'off'}`),
      icon: 'volume-high-sharp',
      enabled: userPreferences.sessionSpeechSynthesizer,
      section: SettingsSections.SESSION
    }
  ], [t, notificationsEnabled, userPreferences, currentMainLang, currentTranslationLang, currentApplicationLang]);

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
        handleNotificationsSettingItemPress();
        break;
      case SettingsItems.FLASHCARD_SIDE:
        userPreferences.setFlashcardSide(userPreferences.flashcardSide === FLASHCARD_SIDE.WORD ? FLASHCARD_SIDE.TRANSLATION : FLASHCARD_SIDE.WORD);
        break;
      case SettingsItems.SESSION_SPEECH_SYNTHESIZER:
        userPreferences.setSessionSpeechSynthesizer(!userPreferences.sessionSpeechSynthesizer);
        break;
      default:
        break;
    }
  }, [userPreferences, notificationsEnabled, languageBottomSheetRef]);

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
    !title ? <></> : <CustomText weight='Bold' style={styles.section}>{title}</CustomText>
  );

  const sections = useMemo(() => {
    return Object.values(SettingsSections)
      .map((section: number) => ({
        title: getSectionTitle(section),
        data: settingsItems.filter(item => item.section === section)
      }))

  }, [settingsItems, t]);

  return (
    <>
      <LanguageBottomSheet
        ref={languageBottomSheetRef}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
        languageType={pickedLanguageType}
      />
      <View style={styles.root}>
        <View style={style}/>
        <SectionList
          sections={sections}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          ListHeaderComponent={
            <>
              <CustomText weight="Bold" style={[styles.title, { paddingTop: insets.top }]}>{t('settings')}</CustomText>
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