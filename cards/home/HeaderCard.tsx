import React, { useEffect, useRef, useState } from "react";
import { BackHandler, Pressable, StyleSheet, View } from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { expo } from '../../app.json'
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../src/constants";
import CustomText from "../../components/CustomText";
import { ProgressBar } from "react-native-paper";
import { useTranslation } from "react-i18next";
import ActionButton from "../../components/ActionButton";
import StartSessionBottomSheet, { FLASHCARD_SIDE, SESSION_MODE } from "../../sheets/StartSessionBottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import SquareFlag from "../../components/SquareFlag";
import { useLanguage } from "../../hooks/useLanguage";
import LanguageBottomSheet from "../../sheets/LanguageBottomSheet";
import { useWords } from "../../store/WordsContext";
import { useStatistics } from "../../hooks/useStatistics";
import { getCurrentStreak, Streak } from "../../utils/streakUtils";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const HeaderCard = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const langContext = useLanguage();
  const wordsContext = useWords();
  const { langWords } = wordsContext;
  const statisticsContext = useStatistics();
  const [streak, setStreak] = useState<Streak>({ numberOfDays: 0, active: false });
  const languageSheetRef = useRef<BottomSheetModal>(null);
  const sessionSheetRef = useRef<BottomSheetModal>(null);
  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);

  const availableWords = langWords.length <= 50 ? langWords.length : 50;
  const lastWellKnownWords = availableWords < 5 ? 1 : Math.round((langWords.slice(0, 50).filter(
    word => word.repetitionCount > 2 && new Date(word.nextReviewDate) > new Date()).length / availableWords) * 100) / 100;
  const wellKnownWords = langWords.filter(word => word.repetitionCount > 2).length;

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

  useEffect(() => {
    setStreak(getCurrentStreak(statisticsContext.studyDaysList));
  }, [statisticsContext.studyDaysList]);

  const handleActinButtonPress = () => {
    sessionSheetRef.current.present();
  }

  const handleSessionStart = (length: 1 | 2 | 3, mode: SESSION_MODE, flashcardSide: FLASHCARD_SIDE) => {
    sessionSheetRef.current.close();
    navigation.navigate('Session', { length: length, mode: mode, flashcardSide: flashcardSide });
  }

  const getReportMessage = () => {
    const percentage = Math.floor(lastWellKnownWords * 100);

    if (langWords.length < 5) return t('report1');
    if (wellKnownWords <= 10 && lastWellKnownWords < 0.1) return t('report2');
    if (wellKnownWords > 10 && lastWellKnownWords < 0.1) return t('report3', { wellKnownWords });
    if (lastWellKnownWords >= 0.1 && wellKnownWords <= 10) return t('report4', { percentage });
    if (lastWellKnownWords >= 0.9) return t('report5', { percentage, wellKnownWords });
    return t('report6', { percentage, wellKnownWords });
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
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <CustomText weight={"Bold"} style={styles.mainText}>{expo.name}</CustomText>
        <MaterialCommunityIcons name={'fire'} size={30} color={streak.active ? colors.red : colors.primary600}/>
        <CustomText weight={"Bold"} style={[styles.streakText, !streak.active && { color: colors.primary600 }]}>
          {streak.numberOfDays.toString()}
        </CustomText>
        <Pressable onPress={() => languageSheetRef.current?.present()} style={{ paddingVertical: 5, paddingLeft: 5 }}>
          <SquareFlag languageCode={langContext.studyingLangCode} size={24}/>
        </Pressable>
      </View>
      <ProgressBar animatedValue={lastWellKnownWords} color={colors.primary300} style={styles.progressBar}/>
      <CustomText style={styles.descText}>{getReportMessage()}</CustomText>
      <ActionButton
        label={t('startLearning')}
        primary={true}
        icon={'play'}
        active={langWords.length >= 5}
        style={styles.actionButton}
        onPress={handleActinButtonPress}
      />
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingVertical: MARGIN_VERTICAL,
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
  }
});

export default HeaderCard;