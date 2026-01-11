import { BackHandler, RefreshControl, ScrollView, View } from "react-native";
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
import EnableNotificationsBottomSheet from "../sheets/EnableNotificationsBottomSheet";
import { FlashcardSide, SessionLength, useUserPreferences } from "../../store/UserPreferencesContext";
import * as Notifications from "expo-notifications";
import { registerNotificationsToken } from "../../utils/registerNotificationsToken";
import { ScreenName } from "../../navigation/AppStack";
import { SessionMode } from "../../types";

const HomeScreen = ({ navigation }) => {
  const auth = useAuth();
  const words = useWords();
  const sessions = useSessions();
  const suggestions = useSuggestions();
  const evaluations = useEvaluations();
  const [refreshing, setRefreshing] = useState(false);
  const { style, onScroll } = useDynamicStatusBar(100, 0.5);
  const insets = useSafeAreaInsets();

  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);
  const enableNotificationsRef = useRef<BottomSheetModal>(null);
  const { askLaterNotifications } = useUserPreferences();
  const { user } = useAuth();

  const tryToRefreshData = async () => {
    try {
      setRefreshing(true);
      await checkUpdates();
      await words.syncWords();
      await Promise.all([
        sessions.syncSessions(),
        suggestions.syncSuggestions(),
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
    tryToRefreshData();
  }, [words, sessions, suggestions, evaluations, auth]);

  const navigateToSessionScreen = (length: SessionLength, mode: SessionMode, flashcardSide: FlashcardSide) => {
    navigation.navigate(ScreenName.Session, { length: length, mode: mode, flashcardSide: flashcardSide });
  }

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
        <HeaderCard navigateToSessionScreen={navigateToSessionScreen} />
        <WordsSuggestionsCard/>
        <StatisticsCard/>
      </ScrollView>
    </>
  );
};

export default HomeScreen;