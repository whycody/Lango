import React, { FC, useEffect, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { WordSource } from '../../../constants/Word';
import { useSessions, useStatistics, useWords } from '../../../store';
import { Word } from '../../../types';
import { Header } from '../../components';
import { StatisticItem } from '../../components/home';

type StatisticsCardProps = {
    style?: StyleProp<ViewStyle>;
};

export const StatisticsCard: FC<StatisticsCardProps> = ({ style }) => {
    const { t } = useTranslation();
    const { langWords } = useWords();
    const statsContext = useStatistics();
    const { sessions } = useSessions();

    const [studyStats, setStudyStats] = useState({
        numberOfLangoWords: langWords.filter(
            word => word.source == WordSource.LANGO && !word.removed,
        ).length,
        numberOfSessions: statsContext.numberOfSessions,
        numberOfStudyDays: statsContext.studyDaysList.length,
        numberOfWords: langWords.filter((word: Word) => !word.removed).length,
    });

    const updateStat = (key: keyof typeof studyStats, value: number) => {
        setStudyStats(prevStats => ({
            ...prevStats,
            [key]: value,
        }));
    };

    useEffect(() => {
        updateStat('numberOfWords', langWords.filter((word: Word) => !word.removed).length);
        updateStat(
            'numberOfLangoWords',
            langWords.filter(word => word.source == WordSource.LANGO && !word.removed).length,
        );
        updateStat('numberOfStudyDays', statsContext.studyDaysList.length);
        updateStat('numberOfSessions', statsContext.numberOfSessions);
    }, [langWords, statsContext.studyDaysList, sessions]);

    return (
        <View style={[styles.root, style]}>
            <Header subtitle={t('statisticsDesc')} title={t('statistics')} />
            <View style={styles.statisticsRow}>
                <StatisticItem
                    description={t('words')}
                    icon={'layers-outline'}
                    label={studyStats.numberOfWords.toString()}
                    style={[styles.statisticsItem, styles.marginRight]}
                />
                <StatisticItem
                    description={t('sessions')}
                    icon={'repeat-outline'}
                    label={studyStats.numberOfSessions.toString()}
                    style={[styles.statisticsItem, styles.marginLeft]}
                />
            </View>
            <View style={styles.statisticsRow}>
                <StatisticItem
                    description={t('studyDays')}
                    icon={'calendar-outline'}
                    label={studyStats.numberOfStudyDays.toString()}
                    style={[styles.statisticsItem, styles.marginRight]}
                />
                <StatisticItem
                    description={t('langoWords')}
                    icon={'layers-outline'}
                    label={studyStats.numberOfLangoWords.toString()}
                    style={[styles.statisticsItem, styles.marginLeft]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    marginLeft: {
        marginLeft: 6,
    },
    marginRight: {
        marginRight: 6,
    },
    root: {
        paddingBottom: MARGIN_VERTICAL + MARGIN_HORIZONTAL / 2,
        paddingHorizontal: MARGIN_HORIZONTAL,
        paddingTop: MARGIN_VERTICAL,
    },
    statisticsItem: {
        flex: 1,
    },
    statisticsRow: {
        flexDirection: 'row',
        marginTop: 12,
    },
});
