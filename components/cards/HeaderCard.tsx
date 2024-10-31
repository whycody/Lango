import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { expo } from '../../app.json'
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../src/constants";
import CustomText from "../CustomText";
import { ProgressBar } from "react-native-paper";
import { useTranslation } from "react-i18next";
import MainActionButton from "../MainActionButton";

const HeaderCard = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.root}>
      <CustomText weight={"Bold"} style={styles.mainText}>{expo.name}</CustomText>
      <ProgressBar progress={0.62} color={colors.primary300} style={styles.progressBar}/>
      <CustomText style={styles.descText}>
        {t('wordsPercentage', { percentage: 62 }) + ' ' + t('practiceNow')}
      </CustomText>
      <MainActionButton label={t('startSession')} icon={'play'} style={styles.actionButton}/>
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
  },
   progressBar: {
    backgroundColor: colors.card,
    marginTop: 12,
    height: 7
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