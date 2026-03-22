import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { PermissionStatus } from 'expo-notifications';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { SessionMode } from '../../constants/Session';
import { FlashcardSide, SessionLength } from '../../constants/UserPreferences';
import { useDynamicStatusBar } from '../../hooks';
import { ScreenName } from '../../navigation/AppStack';
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
import { registerNotificationsToken } from '../../utils/registerNotificationsToken';
import { HeaderCard, StatisticsCard, WordsSuggestionsCard } from '../containers';
import { EnableNotificationsBottomSheet, PickLanguageLevelBottomSheet } from '../sheets';

export const HomeScreen = ({ navigation }) => {
    const auth = useAuth();
    const words = useWords();
    const sessions = useSessions();
    const suggestions = useSuggestions();
    const evaluations = useEvaluations();
    const [refreshing, setRefreshing] = useState(false);
    const { onScroll, style } = useDynamicStatusBar(100, 0.5);
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = getStyles(colors, insets);

    const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);
    const enableNotificationsRef = useRef<BottomSheetModal>(null);
    const pickLanguageLevelRef = useRef<BottomSheetModal>(null);
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
            await words.syncWords();
            await Promise.all([
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
            const { status } = await Notifications.getPermissionsAsync();
            if (status == PermissionStatus.GRANTED && user.notificationsEnabled)
                registerNotificationsToken();
            if (
                (askLaterNotifications && Date.now() < askLaterNotifications) ||
                status == PermissionStatus.GRANTED
            )
                return;
            trackEvent(AnalyticsEventName.ENABLE_NOTIFICATIONS_SHEET_OPEN);
            enableNotificationsRef.current?.present();
        };

        checkNotifications();
    }, [askLaterNotifications]);

    useEffect(() => {
        if (!user.languageLevels?.some(level => level.language == mainLang)) {
            pickLanguageLevelRef.current?.present();
        }
    }, []);

    useEffect(() => {
        const handleBackPress = () => {
            if (bottomSheetIsShown) {
                enableNotificationsRef.current?.dismiss();
                return true;
            }
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => subscription.remove();
    }, [bottomSheetIsShown]);

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

    const handleBottomSheetChangeIndex = (index: number) => {
        setBottomSheetIsShown(index >= 0);
    };

    return (
        <>
            <PickLanguageLevelBottomSheet
                language={languages.find(l => l.languageCode === mainLang)}
                ref={pickLanguageLevelRef}
                onChangeIndex={handleBottomSheetChangeIndex}
            />
            <EnableNotificationsBottomSheet
                ref={enableNotificationsRef}
                onChangeIndex={handleBottomSheetChangeIndex}
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

const getStyles = (colors: any, insets: EdgeInsets) =>
    StyleSheet.create({
        darkBackground: {
            backgroundColor: colors.card,
        },
        spacer: {
            height: insets.top,
        },
    });
