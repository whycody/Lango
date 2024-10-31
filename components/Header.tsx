import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "@react-navigation/native";
import { expo } from '.././app.json'
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import CustomText from "./CustomText";
import { ProgressBar } from "react-native-paper";
import { useTranslation } from "react-i18next";
import ScrollView = Animated.ScrollView;

const Header = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <CustomText weight={"Bold"} style={styles.mainText}>{expo.name}</CustomText>
      <ProgressBar progress={0.62} color={colors.primary} style={styles.progressBar}/>
      <CustomText style={styles.descText}>
        {t('wordsPercentage', { percentage: 62 }) + ' ' + t('practiceNow')}
      </CustomText>
    </ScrollView>
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
  },
  descText: {
    fontSize: 15,
    color: colors.primary600,
    marginTop: 12,
  },
  progressBar: {
    backgroundColor: colors.card,
    marginTop: 12,
    height: 7
  }
});

export default Header;