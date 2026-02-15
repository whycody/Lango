import React, { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppState, BackHandler, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { expo } from '../../../../app.json'
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../../constants/margins";
import CustomText from "../../components/CustomText";
import { ProgressBar } from "react-native-paper";
import { useTranslation } from "react-i18next";
import ActionButton from "../../components/ActionButton";
import StartSessionBottomSheet from "../../sheets/StartSessionBottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import SquareFlag from "../../components/SquareFlag";
import LanguageBottomSheet from "../../sheets/LanguageBottomSheet";
import { getCurrentStreak, Streak } from "../../../utils/streakUtils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SessionMode } from "../../../types";
import { FlashcardSide, SessionLength } from "../../../store/UserPreferencesContext";
import { useStatistics } from "../../../store/StatisticsContext";
import { useLanguage } from "../../../store/LanguageContext";
import { useWordsHeuristicStates } from "../../../store/WordsHeuristicStatesContext";
import { useWords } from "../../../store/WordsContext";
import { trackEvent } from "../../../utils/analytics";
import { AnalyticsEventName } from "../../../constants/AnalyticsEventName";

type HeaderCardProps = {
  navigateToSessionScreen(length: SessionLength, mode: SessionMode, flashcardSide: FlashcardSide): void;
}

const HeaderCard: FC<HeaderCardProps> = ({ navigateToSessionScreen }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const langContext = useLanguage();
  const { langWords } = useWords();
  const { langWordsHeuristicStates } = useWordsHeuristicStates();
  const statisticsContext = useStatistics();
  const [streak, setStreak] = useState<Streak>({ numberOfDays: 0, active: false });
  const languageSheetRef = useRef<BottomSheetModal>(null);
  const sessionSheetRef = useRef<BottomSheetModal>(null);
  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);

  const last50Words = langWords.sort((a, b) => new Date(b.addDate).getTime() - new Date(a.addDate).getTime())
    .slice(0, 50).map((word) => word.id);
  const langWordsHeuristicStatesFiltered = langWordsHeuristicStates.filter(word => last50Words.includes(word.wordId));

  const lastWellKnownWords = last50Words.length < 5 ? 1 : Math.round((langWordsHeuristicStatesFiltered.filter(
    word => word.studyCount > 2 && new Date(word.nextReviewDate) > new Date()).length / last50Words.length) * 100) / 100;
  const wellKnownWords = langWordsHeuristicStates.filter(word => word.studyCount > 2).length;

  useEffect(() => {
    const handleBackPress = () => {
      if (bottomSheetIsShown) {
        languageSheetRef.current?.dismiss();
        sessionSheetRef.current?.dismiss();
        return true;
      }
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => subscription.remove();
  }, [bottomSheetIsShown]);

  useLayoutEffect(() => {
    setStreak(getCurrentStreak(statisticsContext.studyDaysList));
  }, [statisticsContext.studyDaysList]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      setStreak(getCurrentStreak(statisticsContext.studyDaysList));
    });

    return () => subscription.remove();
  }, [statisticsContext.studyDaysList]);

  const handleActionButtonPress = () => {
    trackEvent(AnalyticsEventName.START_SESSION_SHEET_OPEN)
    sessionSheetRef.current.present();
  }

  const handleSessionStart = (length: SessionLength, mode: SessionMode, flashcardSide: FlashcardSide) => {
    sessionSheetRef.current.close();
    navigateToSessionScreen(length, mode, flashcardSide);
  }

  const getReportMessage = () => {
    const percentage = Math.floor(lastWellKnownWords * 100);

    if (langWordsHeuristicStates.length < 5) return t('report1');
    if (wellKnownWords <= 10 && lastWellKnownWords < 0.1) return t('report2');
    if (wellKnownWords > 10 && lastWellKnownWords < 0.1) return t('report3', { wellKnownWords });
    if (lastWellKnownWords >= 0.1 && wellKnownWords <= 10) return t('report4', { percentage });
    if (lastWellKnownWords >= 0.9) return t('report5', { percentage, wellKnownWords });
    return t('report6', { percentage, wellKnownWords });
  }

  const handleLanguageSheetOpen = () => {
    trackEvent(AnalyticsEventName.LANGUAGE_SHEET_OPEN, { source: 'main_screen', type: 'main' });
    languageSheetRef.current.present();
  }

  return (
    <View style={styles.root}>
      <StartSessionBottomSheet
        ref={sessionSheetRef}
        onSessionStart={handleSessionStart}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
      />
      <LanguageBottomSheet
        ref={languageSheetRef}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
      />
      <View style={styles.container}>
        <CustomText weight={"Bold"} style={styles.mainText}>{expo.name}</CustomText>
        <MaterialCommunityIcons name={'fire'} size={30} color={streak.active ? colors.red : colors.primary600}/>
        <CustomText weight={"Bold"} style={[styles.streakText, !streak.active && { color: colors.primary600 }]}>
          {streak.numberOfDays.toString()}
        </CustomText>
        <Pressable onPress={handleLanguageSheetOpen} style={styles.flag}>
          <SquareFlag languageCode={langContext.mainLang} size={24}/>
        </Pressable>
      </View>

      <ProgressBar
        animatedValue={lastWellKnownWords ? lastWellKnownWords : 0.000001}
        color={colors.primary300}
        style={styles.progressBar}
      />
      <CustomText style={styles.descText}>{getReportMessage()}</CustomText>

      <ActionButton
        label={t('startLearning')}
        primary={true}
        icon={'play'}
        active={langWordsHeuristicStates.length >= 5}
        style={styles.actionButton}
        onPress={handleActionButtonPress}
      />
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingVertical: MARGIN_VERTICAL,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  mainText: {
    color: colors.primary,
    fontSize: 26,
    flex: 1,
  },
  progressBar: {
    backgroundColor: colors.cardAccent300,
    marginTop: 12,
    height: 7
  },
  streakText: {
    color: colors.primary,
    fontSize: 18,
    marginRight: 15,
  },
  descText: {
    fontSize: 15,
    color: colors.primary600,
    marginTop: 16,
  },
  actionButton: {
    marginTop: 32,
  },
  flag: {
    paddingVertical: 5,
    paddingLeft: 5
  }
});

export default HeaderCard;