import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, NavigationProp, useTheme } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { SessionMode } from '../../constants/Session';
import { FlashcardSide, SessionLength } from '../../constants/UserPreferences';
import { useDynamicStatusBar } from '../../hooks';
import { RootStackParamList, ScreenName } from '../../navigation/navigationTypes';
import { TabsParamList } from '../../navigation/TabsNavigator';
import {
    useAuth,
    useEvaluations,
    useLanguage,
    useSessions,
    useSuggestions,
    useUserPreferences,
    useWords,
} from '../../store';
import { trackEvent } from '../../utils/analytics';
import { checkUpdates } from '../../utils/checkUpdates';
import { isNotificationPermissionGranted } from '../../utils/ensureNotificationPermission';
import { registerNotificationsToken } from '../../utils/registerNotificationsToken';
import { HeaderCard, StatisticsCard, WordsSuggestionsCard } from '../containers';
import { EnableNotificationsBottomSheet, PickLanguageLevelBottomSheet } from '../sheets';
import { CustomTheme } from '../Theme';

const ENABLE_NOTIFICATIONS_SHEET_NAME = 'enable-notifications-sheet';
const HOME_PICK_LANGUAGE_LEVEL_SHEET_NAME = 'home-pick-language-level-sheet';

type HomeScreenNavProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabsParamList, 'Home'>,
    NavigationProp<RootStackParamList>
>;

export const HomeScreen = ({ navigation }: { navigation: HomeScreenNavProp }) => {
    const auth = useAuth();
    const words = useWords();
    const sessions = useSessions();
    const suggestions = useSuggestions();
    const evaluations = useEvaluations();
    const [refreshing, setRefreshing] = useState(false);
    const { onScroll, style } = useDynamicStatusBar(100, 0.5);
    const insets = useSafeAreaInsets();
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors, insets);

    const { askLaterNotifications } = useUserPreferences();
    const { languages, mainLang, translationLang } = useLanguage();
    const { user } = useAuth();

    useEffect(() => {
        trackEvent(AnalyticsEventName.NAVIGATE_HOME);
    }, []);

    const tryToRefreshData = async () => {
        try {
            setRefreshing(true);
            await checkUpdates();
            await Promise.all([
                words.syncWords(),
                sessions.syncSessions(),
                mainLang !== translationLang ? suggestions.syncSuggestions() : Promise.resolve(),
                evaluations.syncEvaluations(),
            ]);
        } finally {
            await auth.getSession();
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const checkNotifications = async () => {
            const permissions = await Notifications.getPermissionsAsync();
            const hasNotificationPermission = isNotificationPermissionGranted(permissions);

            if (hasNotificationPermission && user?.notificationsEnabled)
                registerNotificationsToken();
            if (
                (askLaterNotifications && Date.now() < askLaterNotifications) ||
                hasNotificationPermission
            )
                return;
            trackEvent(AnalyticsEventName.ENABLE_NOTIFICATIONS_SHEET_OPEN);
            TrueSheet.present(ENABLE_NOTIFICATIONS_SHEET_NAME);
        };

        checkNotifications();
    }, [askLaterNotifications]);

    useEffect(() => {
        if (
            translationLang !== mainLang &&
            !user?.languageLevels?.some(level => level.language == mainLang)
        ) {
            TrueSheet.present(HOME_PICK_LANGUAGE_LEVEL_SHEET_NAME);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        trackEvent(AnalyticsEventName.HOME_REFRESH);
        await tryToRefreshData();
    }, [words, sessions, suggestions, evaluations, auth]);

    const navigateToSessionScreen = (
        length: SessionLength,
        mode: SessionMode,
        flashcardSide: FlashcardSide,
    ) => {
        const props = { flashcardSide, length, mode, restarted: false };
        trackEvent(AnalyticsEventName.SESSION_STARTED, props);
        navigation.navigate(ScreenName.Session, props);
    };

    const languagesAreTheSame = mainLang === translationLang;

    return (
        <>
            <EnableNotificationsBottomSheet sheetName={ENABLE_NOTIFICATIONS_SHEET_NAME} />
            <PickLanguageLevelBottomSheet
                allowDismiss={false}
                language={languages.find(l => l.languageCode === mainLang)}
                sheetName={HOME_PICK_LANGUAGE_LEVEL_SHEET_NAME}
            />
            <View style={style} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        progressViewOffset={50}
                        refreshing={
                            refreshing ||
                            suggestions.loading ||
                            words.loading ||
                            evaluations.loading ||
                            sessions.loading
                        }
                        onRefresh={onRefresh}
                    />
                }
                onScroll={onScroll}
            >
                <View style={styles.spacer} />
                <HeaderCard navigateToSessionScreen={navigateToSessionScreen} />
                {!languagesAreTheSame && <WordsSuggestionsCard />}
                <StatisticsCard style={languagesAreTheSame && styles.darkBackground} />
            </ScrollView>
        </>
    );
};

const getStyles = (colors: CustomTheme['colors'], insets: EdgeInsets) =>
    StyleSheet.create({
        darkBackground: {
            backgroundColor: colors.card,
        },
        spacer: {
            height: insets.top,
        },
    });
