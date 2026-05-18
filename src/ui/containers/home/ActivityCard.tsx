import React, { useCallback, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { useSessions } from '../../../store';
import { CustomText, Header } from '../../components';
import { CustomTheme } from '../../Theme';

const DAYS_PER_WEEK = 7;
const CELL_GAP = 3;
const TOTAL_WEEKS = 52;

type CellStyles = ReturnType<typeof getStyles>;

const getCellStyle = (styles: CellStyles, count: number) => {
    if (count < 0) return styles.cellFuture;
    if (count === 0) return styles.cellInactive;
    if (count === 1) return styles.cellLevel1;
    if (count === 2) return styles.cellLevel2;
    return styles.cellLevel3;
};

export const ActivityCard = () => {
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const { sessions } = useSessions();
    const { width } = useWindowDimensions();
    const scrollRef = useRef<ScrollView>(null);

    const WEEKS_VISIBLE = 17;
    const availableWidth = width - MARGIN_HORIZONTAL * 2;
    const cellWidth = availableWidth / WEEKS_VISIBLE;
    const cellSize = cellWidth - CELL_GAP;

    const sessionCountByDay = useMemo(() => {
        const map = new Map<string, number>();
        for (const s of sessions) {
            if (s.localDay) map.set(s.localDay, (map.get(s.localDay) ?? 0) + 1);
        }
        return map;
    }, [sessions]);

    const monthNames = t('months', { returnObjects: true }) as string[];

    const { monthLabels, weeks } = useMemo(() => {
        const today = new Date();
        const dayOfWeek = (today.getDay() + 6) % 7;
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek - (TOTAL_WEEKS - 1) * 7);
        startDate.setHours(0, 0, 0, 0);

        const weeksArray: { count: number; dateStr: string }[][] = [];
        const monthLabelsArray: { label: string; weekIndex: number }[] = [];
        let lastMonth = -1;

        for (let w = 0; w < TOTAL_WEEKS; w++) {
            const week: { count: number; dateStr: string }[] = [];
            for (let d = 0; d < DAYS_PER_WEEK; d++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + w * 7 + d);
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const isFuture = date > today;
                week.push({
                    count: isFuture ? -1 : (sessionCountByDay.get(dateStr) ?? 0),
                    dateStr,
                });

                if (d === 0 && date.getMonth() !== lastMonth) {
                    lastMonth = date.getMonth();
                    monthLabelsArray.push({
                        label: monthNames[date.getMonth()],
                        weekIndex: w,
                    });
                }
            }
            weeksArray.push(week);
        }

        return { monthLabels: monthLabelsArray, weeks: weeksArray };
    }, [sessionCountByDay, monthNames]);

    const handleContentSizeChange = useCallback(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
    }, []);

    const styles = useMemo(() => getStyles(colors), [colors]);

    return (
        <View style={styles.root}>
            <Header subtitle={t('activityDesc')} title={t('activity')} />
            <View style={styles.container}>
                <ScrollView
                    horizontal
                    contentContainerStyle={styles.scrollContent}
                    ref={scrollRef}
                    showsHorizontalScrollIndicator={false}
                    onContentSizeChange={handleContentSizeChange}
                >
                    <View style={[styles.monthRow, { width: TOTAL_WEEKS * cellWidth }]}>
                        {monthLabels.map(({ label, weekIndex }) => (
                            <CustomText
                                key={`${label}-${weekIndex}`}
                                style={[styles.monthLabel, { left: weekIndex * cellWidth }]}
                                weight={'SemiBold'}
                            >
                                {label}
                            </CustomText>
                        ))}
                    </View>

                    {/* Week columns */}
                    <View style={styles.grid}>
                        {weeks.map((week, wi) => (
                            <View key={wi} style={[styles.weekColumn, { marginRight: CELL_GAP }]}>
                                {week.map((day, di) => (
                                    <View
                                        key={di}
                                        style={[
                                            styles.cell,
                                            {
                                                height: cellSize,
                                                marginBottom: CELL_GAP,
                                                width: cellSize,
                                            },
                                            getCellStyle(styles, day.count),
                                        ]}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        cell: {
            borderRadius: spacing.xxs + 1,
        },
        cellFuture: {
            opacity: 0,
        },
        cellInactive: {
            backgroundColor: colors.card,
        },
        cellLevel1: {
            backgroundColor: colors.primary800,
        },
        cellLevel2: {
            backgroundColor: colors.primary600,
        },
        cellLevel3: {
            backgroundColor: colors.primary300,
        },
        container: {
            flexDirection: 'row',
            marginTop: 10,
        },
        grid: {
            flexDirection: 'row',
        },
        monthLabel: {
            color: colors.white600,
            fontSize: 10,
            position: 'absolute',
        },
        monthRow: {
            height: 18,
            position: 'relative',
        },
        root: {
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: MARGIN_VERTICAL,
        },
        scrollContent: {
            flexDirection: 'column',
        },
        weekColumn: {},
    });
