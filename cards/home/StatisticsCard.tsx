import { StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../src/constants";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useTranslation } from "react-i18next";
import StatisticItem from "../../components/items/StatisticItem";
import { LANGO, useWords } from "../../store/WordsContext";
import { useStatistics } from "../../hooks/useStatistics";

const StatisticsCard = () => {
  const { t } = useTranslation();
  const wordsContext = useWords();
  const statsContext = useStatistics();
  const [studyStats, setStudyStats] = useState({
    numberOfWords: 0,
    numberOfSessions: 0,
    numberOfStudyDays: 0,
    numberOfLangoWords: 0,
  });

  const updateStat = (key: keyof typeof studyStats, value: number) => {
    setStudyStats(prevStats => ({
      ...prevStats,
      [key]: value,
    }));
  };

  useEffect(() => {
    updateStat('numberOfWords', wordsContext.langWords.length);
    updateStat('numberOfLangoWords', wordsContext.langWords.filter((word) => word.source == LANGO).length);
    updateStat('numberOfStudyDays', statsContext.studyDaysList.length);
    updateStat('numberOfSessions', statsContext.numberOfSessions);
  }, [wordsContext.langWords, statsContext.studyDaysList, statsContext.numberOfSessions]);

  return (
    <View style={styles.root}>
      <Header title={t('statistics')} subtitle={t('statisticsDesc')}/>
      <View style={styles.statisticsRow}>
        <StatisticItem
          icon={'layers-outline'}
          label={studyStats.numberOfWords.toString()}
          description={t('words')}
          style={[styles.statisticsItem, { marginRight: 6 }]}
        />
        <StatisticItem
          icon={'repeat-outline'}
          label={studyStats.numberOfSessions.toString()}
          description={t('sessions')}
          style={[styles.statisticsItem, { marginLeft: 6 }]}
        />
      </View>
      <View style={styles.statisticsRow}>
        <StatisticItem
          icon={'calendar-outline'}
          label={studyStats.numberOfStudyDays.toString()}
          description={t('studyDays')}
          style={[styles.statisticsItem, { marginRight: 6 }]}
        />
        <StatisticItem
          icon={'layers-outline'}
          label={studyStats.numberOfLangoWords.toString()}
          description={t('langoWords')}
          style={[styles.statisticsItem, { marginLeft: 6 }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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