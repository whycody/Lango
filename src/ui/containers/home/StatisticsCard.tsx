import React, { FC, useEffect, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { WordSource } from '../../../constants/Word';
import { MAIN_COLLECTION, useWordsForBundle } from '../../../hooks';
import { useSessions, useStatistics } from '../../../store';
import { Header } from '../../components';
import { StatisticItem } from '../../components/home';

type StatisticsCardProps = {
    style?: StyleProp<ViewStyle>;
};

export const StatisticsCard: FC<StatisticsCardProps> = ({ style }) => {
    const { t } = useTranslation();
    const { words: mainCollectionWords } = useWordsForBundle(MAIN_COLLECTION);
    const statsContext = useStatistics();
    const { sessions } = useSessions();

    const [studyStats, setStudyStats] = useState({
        numberOfLangoWords: mainCollectionWords.filter(word => word.source == WordSource.LANGO)
            .length,
        numberOfSessions: statsContext.numberOfSessions,
        numberOfStudyDays: statsContext.studyDaysList.length,
        numberOfWords: mainCollectionWords.length,
    });

    const updateStat = (key: keyof typeof studyStats, value: number) => {
        setStudyStats(prevStats => ({
            ...prevStats,
            [key]: value,
        }));
    };

    useEffect(() => {
        updateStat('numberOfWords', mainCollectionWords.length);
        updateStat(
            'numberOfLangoWords',
            mainCollectionWords.filter(word => word.source == WordSource.LANGO).length,
        );
        updateStat('numberOfStudyDays', statsContext.studyDaysList.length);
        updateStat('numberOfSessions', statsContext.numberOfSessions);
    }, [mainCollectionWords, statsContext.studyDaysList, sessions]);

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
        marginTop: MARGIN_VERTICAL,
        paddingHorizontal: MARGIN_HORIZONTAL,
    },
    statisticsItem: {
        flex: 1,
    },
    statisticsRow: {
        flexDirection: 'row',
        marginTop: 12,
    },
});
