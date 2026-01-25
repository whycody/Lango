import React, { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BackHandler, Pressable, StyleSheet, View } from "react-native";
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
import Header from "../../components/Header";


const HeaderCard = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const { langWordsHeuristicStates } = useWordsHeuristicStates();
  const statisticsContext = useStatistics();
  const [streak, setStreak] = useState<Streak>({ numberOfDays: 0, active: false });
  const languageSheetRef = useRef<BottomSheetModal>(null);
  const sessionSheetRef = useRef<BottomSheetModal>(null);
  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);

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

  return (
    <View style={styles.root}>
      <CustomText weight={'Bold'} style={styles.title}>{t('res.title')}</CustomText>
      <CustomText weight={'Regular'} style={styles.desc}>{t('res.desc')}</CustomText>
      <ActionButton
        label={t('res.add_new_set')}
        primary={true}
        active={langWordsHeuristicStates.length >= 5}
        style={styles.mainButton}
      />
      <ActionButton
        label={t('res.join_set')}
        active={langWordsHeuristicStates.length >= 5}
        style={styles.secondaryButton}

      />
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingVertical: MARGIN_VERTICAL,
  },
  title: {
    color: colors.primary,
    fontSize: 23,
  },
  desc: {
    color: colors.primary600,
    fontSize: 14,
    marginTop: 8
  },
  mainButton: {
    marginTop: 32,
  },
  secondaryButton: {
    marginTop: 8,
  }
});

export default HeaderCard;