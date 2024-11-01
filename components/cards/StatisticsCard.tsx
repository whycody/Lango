import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../src/constants";
import React from "react";
import Header from "../Header";
import { useTranslation } from "react-i18next";
import StatisticItem from "../StatisticItem";

const StatisticsCard = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(colors);

  return (
    <View style={styles.root}>
      <Header title={t('statistics')} subtitle={t('statisticsDesc')}/>
      <View style={styles.statisticsRow}>
        <StatisticItem label={'683'} description={t('words')} style={[styles.statisticsItem, { marginRight: 6 }]}/>
        <StatisticItem label={'107'} description={t('sessions')} style={[styles.statisticsItem, { marginLeft: 6 }]}/>
      </View>
      <View style={styles.statisticsRow}>
        <StatisticItem label={'93'} description={t('studyDays')} style={[styles.statisticsItem, { marginRight: 6 }]}/>
        <StatisticItem label={'120'} description={t('langoWords')} style={[styles.statisticsItem, { marginLeft: 6 }]}/>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    marginHorizontal: MARGIN_HORIZONTAL,
    marginVertical: MARGIN_VERTICAL,
  },
  statisticsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  statisticsItem: {
    flex: 1,
  }
});

export default StatisticsCard;