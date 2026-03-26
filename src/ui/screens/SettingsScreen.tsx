import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, SectionList, StyleSheet, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { PermissionStatus } from 'expo-notifications';
import { useTranslation } from 'react-i18next';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { LanguageTypes } from '../../constants/Language';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { SettingsItems, SettingsSections } from '../../constants/Settings';
import { FlashcardSide } from '../../constants/UserPreferences';
import { useDynamicStatusBar } from '../../hooks';
import { useAuth, useLanguage, useUserPreferences } from '../../store';
import { SettingItem } from '../../types';
import { trackEvent } from '../../utils/analytics';
import { ensureNotificationsPermission } from '../../utils/ensureNotificationPermission';
import { CustomText, VersionFooter } from '../components';
import { LibraryItem } from '../components/library';
import { LanguageBottomSheet } from '../sheets';

const keyExtractor = (item: SettingItem) => item.id.toString();

export const SettingsScreen = () => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors, insets);
    const { t } = useTranslation();
    const { applicationLang, languages, mainLang, translationLang } = useLanguage();
    const { updateUserNotificationsEnabled, user } = useAuth();
    const languageBottomSheetRef = useRef<BottomSheetModal>();
    const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);
    const userPreferences = useUserPreferences();

    const currentMainLang = languages.filter(lang => lang.languageCode === mainLang)[0]
        .languageName;
    const currentTranslationLang = languages.filter(
        lang => lang.languageCode === translationLang,
    )[0].languageName;
    const currentApplicationLang = languages.filter(
        lang => lang.languageCode === applicationLang,
    )[0].languageName;

    const [pickedLanguageType, setPickedLanguageType] = useState<LanguageTypes>(LanguageTypes.MAIN);
    const { onScroll, style } = useDynamicStatusBar(100, 0.5);
    const notificationsEnabled =
        userPreferences.notificationsPermissionStatus == PermissionStatus.GRANTED &&
        user.notificationsEnabled;

    useEffect(() => {
        const handleBackPress = () => {
            if (bottomSheetIsShown) {
                languageBottomSheetRef.current?.dismiss();
                return true;
            }
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => subscription.remove();
    }, [bottomSheetIsShown]);

    useLayoutEffect(() => {
        const checkPermissions = async () => {
            const { status } = await Notifications.getPermissionsAsync();
            userPreferences.setNotificationsPermissionStatus(status);
        };

        checkPermissions();
    }, []);

    const checkNotifications = async () => {
        const granted = await ensureNotificationsPermission();

        if (!granted) {
            trackEvent(AnalyticsEventName.NOTIFICATIONS_ENABLE_FAILURE, {
                reason: 'Permissions not granted',
            });
            return;
        }

        trackEvent(AnalyticsEventName.NOTIFICATIONS_ENABLE_SUCCESS);
        userPreferences.setNotificationsPermissionStatus(PermissionStatus.GRANTED);
        updateUserNotificationsEnabled(true);
    };

    const handleNotificationsSettingItemPress = async () => {
        if (!notificationsEnabled) {
            await checkNotifications();
        } else {
            trackEvent(AnalyticsEventName.NOTIFICATIONS_DISABLE);
            updateUserNotificationsEnabled(false);
        }
    };

    const settingsItems: SettingItem[] = useMemo(
        () => [
            {
                description: currentMainLang,
                icon: 'language-sharp',
                id: SettingsItems.MAIN_LANGUAGE,
                label: t('main_language'),
                section: SettingsSections.LANGUAGE,
            },
            {
                description: currentTranslationLang,
                icon: 'language-sharp',
                id: SettingsItems.TRANSLATION_LANGUAGE,
                label: t('translation_language'),
                section: SettingsSections.LANGUAGE,
            },
            {
                description: currentApplicationLang,
                icon: 'language-sharp',
                id: SettingsItems.APPLICATION_LANGUAGE,
                label: t('application_language'),
                section: SettingsSections.LANGUAGE,
            },
            {
                description: t(`turned_${userPreferences.vibrationsEnabled ? 'on' : 'off'}_m`),
                enabled: userPreferences.vibrationsEnabled,
                icon: 'phone-portrait-sharp',
                id: SettingsItems.VIBRATIONS,
                label: t('vibrations'),
                section: SettingsSections.PREFERENCES,
            },
            {
                description: t(`turned_${notificationsEnabled ? 'on' : 'off'}_m`),
                enabled: notificationsEnabled,
                icon: 'notifications-sharp',
                id: SettingsItems.NOTIFICATIONS,
                label: t('notifications'),
                section: SettingsSections.PREFERENCES,
            },
            {
                description:
                    userPreferences.flashcardSide == FlashcardSide.WORD
                        ? t('word')
                        : t('translation'),
                icon: 'document-text-sharp',
                id: SettingsItems.FLASHCARD_SIDE,
                label: t('flashcard_side'),
                section: SettingsSections.SESSION,
            },
            {
                description: t(`turned_${userPreferences.sessionSpeechSynthesizer ? 'on' : 'off'}`),
                enabled: userPreferences.sessionSpeechSynthesizer,
                icon: 'volume-high-sharp',
                id: SettingsItems.SESSION_SPEECH_SYNTHESIZER,
                label: t('speech_synthesizer'),
                section: SettingsSections.SESSION,
            },
        ],
        [
            t,
            notificationsEnabled,
            userPreferences,
            currentMainLang,
            currentTranslationLang,
            currentApplicationLang,
        ],
    );

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
    };

    const mapSettingsToLanguageType = (id: SettingsItems): LanguageTypes => {
        switch (id) {
            case SettingsItems.MAIN_LANGUAGE:
                return LanguageTypes.MAIN;
            case SettingsItems.TRANSLATION_LANGUAGE:
                return LanguageTypes.TRANSLATION;
            case SettingsItems.APPLICATION_LANGUAGE:
                return LanguageTypes.APPLICATION;
        }
    };

    const handlePress = useCallback(
        (id: SettingsItems) => {
            switch (id) {
                case SettingsItems.TRANSLATION_LANGUAGE:
                case SettingsItems.APPLICATION_LANGUAGE:
                case SettingsItems.MAIN_LANGUAGE: {
                    const languageType = mapSettingsToLanguageType(id);
                    trackEvent(AnalyticsEventName.LANGUAGE_SHEET_OPEN, {
                        source: 'settings_screen',
                        type:
                            languageType == LanguageTypes.MAIN
                                ? 'main'
                                : languageType === LanguageTypes.TRANSLATION
                                  ? 'translation'
                                  : 'app',
                    });
                    setPickedLanguageType(languageType);
                    languageBottomSheetRef.current?.present();
                    break;
                }
                case SettingsItems.VIBRATIONS:
                    userPreferences.setVibrationsEnabled(!userPreferences.vibrationsEnabled);
                    break;
                case SettingsItems.NOTIFICATIONS:
                    handleNotificationsSettingItemPress();
                    break;
                case SettingsItems.FLASHCARD_SIDE:
                    userPreferences.setFlashcardSide(
                        userPreferences.flashcardSide === FlashcardSide.WORD
                            ? FlashcardSide.TRANSLATION
                            : FlashcardSide.WORD,
                    );
                    break;
                case SettingsItems.SESSION_SPEECH_SYNTHESIZER:
                    userPreferences.setSessionSpeechSynthesizer(
                        !userPreferences.sessionSpeechSynthesizer,
                    );
                    break;
                default:
                    break;
            }
        },
        [userPreferences, notificationsEnabled, languageBottomSheetRef],
    );

    const renderSettingsItem = ({ index, item }) => (
        <LibraryItem
            key={item.id}
            description={item.description}
            enabled={item.enabled}
            icon={item.icon}
            index={0}
            label={item.label}
            style={index !== 0 && { borderColor: colors.card, borderTopWidth: 3 }}
            onPress={() => handlePress(item.id)}
        />
    );

    const renderSectionHeader = (title: string) =>
        title ? (
            <CustomText style={styles.section} weight="Bold">
                {title}
            </CustomText>
        ) : (
            <></>
        );

    const renderListFooterComponent = () => <VersionFooter style={styles.footer} />;

    const sections = useMemo(() => {
        return Object.values(SettingsSections).map((section: number) => ({
            data: settingsItems.filter(item => item.section === section),
            title: getSectionTitle(section),
        }));
    }, [settingsItems, t]);

    return (
        <>
            <LanguageBottomSheet
                allLanguages={true}
                languageType={pickedLanguageType}
                ref={languageBottomSheetRef}
                onChangeIndex={index => setBottomSheetIsShown(index >= 0)}
            />
            <View style={styles.root}>
                <View style={style} />
                <SectionList
                    ListFooterComponent={renderListFooterComponent}
                    keyExtractor={keyExtractor}
                    renderItem={renderSettingsItem}
                    renderSectionHeader={({ section }) => renderSectionHeader(section.title)}
                    sections={sections}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled={false}
                    ListHeaderComponent={
                        <>
                            <CustomText style={styles.title} weight="Bold">
                                {t('settings')}
                            </CustomText>
                            <CustomText style={styles.subtitle}>
                                {t('settings_long_desc')}
                            </CustomText>
                        </>
                    }
                    onScroll={onScroll}
                />
            </View>
        </>
    );
};

const getStyles = (colors: any, insets: EdgeInsets) =>
    StyleSheet.create({
        footer: {
            marginVertical: MARGIN_VERTICAL / 2,
        },
        root: {
            backgroundColor: colors.card,
            flex: 1,
        },
        section: {
            color: colors.primary,
            fontSize: 13,
            marginBottom: 10,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 20,
            textTransform: 'uppercase',
        },
        statusBar: {
            backgroundColor: colors.card,
        },
        subtitle: {
            color: colors.primary600,
            fontSize: 15,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL / 3,
        },
        title: {
            color: colors.primary,
            fontSize: 24,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
            paddingTop: insets.top,
        },
    });
