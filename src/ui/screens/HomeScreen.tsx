import { BackHandler, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import HeaderCard from "../cards/home/HeaderCard";
import WordsSuggestionsCard from "../cards/home/WordsSuggestionsCard";
import StatisticsCard from "../cards/home/StatisticsCard";
import { useWords } from "../../store/WordsContext";
import { useSessions } from "../../store/SessionsContext";
import { useEvaluations } from "../../store/EvaluationsContext";
import { useSuggestions } from "../../store/SuggestionsContext";
import { useAuth } from "../../api/auth/AuthProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDynamicStatusBar } from "../../hooks/useDynamicStatusBar";
import { checkUpdates } from "../../utils/checkUpdates";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashcardSide, SessionLength, useUserPreferences } from "../../store/UserPreferencesContext";
import * as Notifications from "expo-notifications";
import { registerNotificationsToken } from "../../utils/registerNotificationsToken";
import { ScreenName } from "../../navigation/AppStack";
import { SessionMode } from "../../types";
import { useLanguage } from "../../store/LanguageContext";
import { useTheme } from "@react-navigation/native";
import { trackEvent } from "../../utils/analytics";
import { AnalyticsEventName } from "../../constants/AnalyticsEventName";
import { EnableNotificationsBottomSheet } from "../sheets";

const HomeScreen = ({ navigation }) => {
  const auth = useAuth();
  const words = useWords();
  const sessions = useSessions();
  const suggestions = useSuggestions();
  const evaluations = useEvaluations();
  const [refreshing, setRefreshing] = useState(false);
  const { style, onScroll } = useDynamicStatusBar(100, 0.5);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);
  const enableNotificationsRef = useRef<BottomSheetModal>(null);
  const { askLaterNotifications } = useUserPreferences();
  const { mainLang, translationLang } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    trackEvent(AnalyticsEventName.NAVIGATE_HOME)
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
  }

  useEffect(() => {
    const checkNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status == 'granted' && user.notificationsEnabled) registerNotificationsToken();
      if ((askLaterNotifications && Date.now() < askLaterNotifications) || status == 'granted') return;
      trackEvent(AnalyticsEventName.ENABLE_NOTIFICATIONS_SHEET_OPEN)
      enableNotificationsRef.current?.present();
    }

    checkNotifications();
  }, [askLaterNotifications]);

  useEffect(() => {
    const handleBackPress = () => {
      if (bottomSheetIsShown) {
        enableNotificationsRef.current?.dismiss();
        return true;
      }
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => subscription.remove();
  }, [bottomSheetIsShown]);

  const onRefresh = useCallback(async () => {
    trackEvent(AnalyticsEventName.HOME_REFRESH)
    await tryToRefreshData();
  }, [words, sessions, suggestions, evaluations, auth]);

  const navigateToSessionScreen = (length: SessionLength, mode: SessionMode, flashcardSide: FlashcardSide) => {
    const props = { length, mode, flashcardSide, restarted: false };
    trackEvent(AnalyticsEventName.SESSION_STARTED, props);
    navigation.navigate(ScreenName.Session, props);
  }

  const languagesAreTheSame = mainLang === translationLang;

  return (
    <>
      <EnableNotificationsBottomSheet
        ref={enableNotificationsRef}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
      />
      <View style={style}/>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || suggestions.loading || words.loading || evaluations.loading || sessions.loading}
            onRefresh={onRefresh}
            progressViewOffset={50}
          />
        }
      >
        <View style={{ height: insets.top }}/>
        <HeaderCard navigateToSessionScreen={navigateToSessionScreen}/>
        {!languagesAreTheSame &&
          <WordsSuggestionsCard/>
        }
        <StatisticsCard style={languagesAreTheSame && styles.darkBackground}/>
      </ScrollView>
    </>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  darkBackground: {
    backgroundColor: colors.card
  }
})

export default HomeScreen;