import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
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
import { isAndroid, isIOS } from '../../utils/deviceUtils';
import { ensureNotificationsPermission } from '../../utils/ensureNotificationPermission';
import { CustomText, ModalDragHandle, VersionFooter } from '../components';
import { LibraryItem } from '../components/library';
import { DeleteAccountBottomSheet, LanguageBottomSheet } from '../sheets';
import { CustomTheme } from '../Theme';

const keyExtractor = (item: SettingItem) => item.id.toString();
const SETTINGS_LANGUAGE_SHEET_NAME = 'settings-language-sheet';
const SETTINGS_DELETE_ACCOUNT_SHEET_NAME = 'settings-delete-account-sheet';

export const SettingsScreen = () => {
    const { colors } = useTheme() as CustomTheme;
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => getStyles(colors, insets), [colors, insets]);
    const { t } = useTranslation();
    const { applicationLang, languages, mainLang, translationLang } = useLanguage();
    const { updateUserNotificationsEnabled, updateUserSuggestionsInSession, user } = useAuth();
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
        user?.notificationsEnabled;

    useLayoutEffect(() => {
        const checkPermissions = async () => {
            const permissions = await Notifications.getPermissionsAsync();
            userPreferences.setNotificationsPermissionStatus(permissions.status);
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
                color: '#2EE6A6',
                description: currentMainLang,
                icon: 'language',
                id: SettingsItems.MAIN_LANGUAGE,
                label: t('main_language'),
                section: SettingsSections.LANGUAGE,
            },
            {
                color: '#2EE6A6',
                description: currentTranslationLang,
                icon: 'language',
                id: SettingsItems.TRANSLATION_LANGUAGE,
                label: t('translation_language'),
                section: SettingsSections.LANGUAGE,
            },
            {
                color: '#4D7CFF',
                description: currentApplicationLang,
                icon: 'globe',
                id: SettingsItems.APPLICATION_LANGUAGE,
                label: t('application_language'),
                section: SettingsSections.LANGUAGE,
            },

            {
                color: '#FFB84D',
                description: t(`turned_${userPreferences.vibrationsEnabled ? 'on' : 'off'}_m`),
                enabled: userPreferences.vibrationsEnabled,
                icon: 'phone-portrait',
                id: SettingsItems.VIBRATIONS,
                label: t('vibrations'),
                section: SettingsSections.PREFERENCES,
            },
            {
                color: '#FF7A59',
                description: t(`turned_${notificationsEnabled ? 'on' : 'off'}_m`),
                enabled: notificationsEnabled,
                icon: 'notifications',
                id: SettingsItems.NOTIFICATIONS,
                label: t('notifications'),
                section: SettingsSections.PREFERENCES,
            },

            {
                color: '#9B6BFF',
                description: t(`turned_${user?.suggestionsInSession ? 'on' : 'off'}_m`),
                enabled: user?.suggestionsInSession,
                icon: 'sparkles',
                id: SettingsItems.SUGGESTIONS_IN_SESSION,
                label: t('new_words_suggestions'),
                section: SettingsSections.SESSION,
            },
            {
                color: userPreferences.flashcardSide == FlashcardSide.WORD ? '#63E6FF' : '#2EE6A6',
                description:
                    userPreferences.flashcardSide == FlashcardSide.WORD
                        ? t('word')
                        : t('translation'),
                icon: 'document-text',
                id: SettingsItems.FLASHCARD_SIDE,
                label: t('flashcard_side'),
                section: SettingsSections.SESSION,
            },
            {
                color: '#B06CFF',
                description: t(`turned_${userPreferences.sessionSpeechSynthesizer ? 'on' : 'off'}`),
                enabled: userPreferences.sessionSpeechSynthesizer,
                icon: 'volume-high',
                id: SettingsItems.SESSION_SPEECH_SYNTHESIZER,
                label: t('speech_synthesizer'),
                section: SettingsSections.SESSION,
            },

            {
                color: '#7B9CFF',
                description: user?.email ?? '',
                icon: 'mail',
                id: SettingsItems.EMAIL_ADDRESS,
                label: t('email_address'),
                section: SettingsSections.ACCOUNT,
            },
            {
                color: '#FF5C5C',
                description: t('delete_account_desc'),
                icon: 'person-remove',
                id: SettingsItems.DELETE_ACCOUNT,
                label: t('delete_account'),
                section: SettingsSections.ACCOUNT,
            },
        ],
        [
            t,
            user?.email,
            user?.suggestionsInSession,
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
            case SettingsSections.ACCOUNT:
                return t('account');
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
            default:
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
                    TrueSheet.present(SETTINGS_LANGUAGE_SHEET_NAME);
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
                case SettingsItems.SUGGESTIONS_IN_SESSION:
                    updateUserSuggestionsInSession(!(user?.suggestionsInSession ?? false));
                    break;
                case SettingsItems.SESSION_SPEECH_SYNTHESIZER:
                    userPreferences.setSessionSpeechSynthesizer(
                        !userPreferences.sessionSpeechSynthesizer,
                    );
                    break;
                case SettingsItems.DELETE_ACCOUNT:
                    TrueSheet.present(SETTINGS_DELETE_ACCOUNT_SHEET_NAME);
                    break;
                default:
                    break;
            }
        },
        [
            userPreferences,
            notificationsEnabled,
            user?.suggestionsInSession,
            updateUserSuggestionsInSession,
        ],
    );

    const renderSettingsItem = ({ index, item }: { index: number; item: SettingItem }) => (
        <LibraryItem
            key={item.id}
            color={item.color}
            description={item.description}
            enabled={item.enabled}
            icon={item.icon}
            index={index}
            label={item.label}
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

    const renderListFooterComponent = useCallback(
        () => <VersionFooter style={styles.footer} />,
        [styles.footer],
    );

    const sections = useMemo(() => {
        const sectionValues = Object.values(SettingsSections).filter(
            (value): value is SettingsSections => typeof value === 'number',
        );

        return sectionValues.map(section => ({
            data: settingsItems.filter(item => item.section === section),
            title: getSectionTitle(section),
        }));
    }, [settingsItems, t]);

    return (
        <>
            <LanguageBottomSheet
                allLanguages={true}
                languageType={pickedLanguageType}
                sheetName={SETTINGS_LANGUAGE_SHEET_NAME}
            />
            <DeleteAccountBottomSheet sheetName={SETTINGS_DELETE_ACCOUNT_SHEET_NAME} />
            <View style={styles.root}>
                <ModalDragHandle />
                {isAndroid && <View style={style} />}
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
                            <CustomText
                                style={[styles.title, isIOS && styles.titleIOS]}
                                weight="Bold"
                            >
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

const getStyles = (colors: CustomTheme['colors'], insets: EdgeInsets) =>
    StyleSheet.create({
        footer: {
            marginVertical: MARGIN_VERTICAL / 2,
        },
        root: {
            backgroundColor: colors.background,
            flex: 1,
        },
        section: {
            color: colors.white,
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
            color: colors.white300,
            fontSize: 15,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 4,
        },
        title: {
            color: colors.white,
            fontSize: 24,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
            paddingTop: isAndroid ? insets.top : MARGIN_VERTICAL,
        },
        titleIOS: {
            marginTop: 0,
        },
    });
