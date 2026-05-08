import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { t } from 'i18next';

import { SHORT_STREAK_ANIMATIONS_DELAY, STREAK_ANIMATIONS_DELAY } from '../../../constants/Streak';
import { getNextMilestone, getPrevMilestone } from '../../../utils/streakUtils';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';
import { StreakTiles } from './StreakTiles';

type StreakBadgeProps = {
    streak: number;
};

export const StreakBadge = ({ streak }: StreakBadgeProps) => {
    const { colors } = useTheme() as CustomTheme;
    const appear = useRef(new Animated.Value(0)).current;
    const [barWidth, setBarWidth] = useState(0);

    const next = getNextMilestone(streak);
    const prev = getPrevMilestone(streak);

    const isGoal = streak === prev;
    const progressAnim = useRef(new Animated.Value(0)).current;

    const styles = useMemo(() => getStyles(colors, isGoal), [colors, isGoal]);

    useEffect(() => {
        const target = isGoal ? 1 : next ? (streak - prev) / (next - prev) : 1;
        progressAnim.stopAnimation(() => {
            progressAnim.setValue(0);
            Animated.sequence([
                Animated.delay(STREAK_ANIMATIONS_DELAY),
                Animated.timing(progressAnim, {
                    duration: 700,
                    toValue: target,
                    useNativeDriver: false,
                }),
            ]).start();
        });
    }, [streak, next, prev, isGoal]);

    useEffect(() => {
        Animated.sequence([
            Animated.delay(SHORT_STREAK_ANIMATIONS_DELAY),
            Animated.spring(appear, {
                friction: 7,
                tension: 70,
                toValue: 1,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const getRandomStreakMessageKey = (key: string, count: number) => {
        const index = Math.floor(Math.random() * count) + 1;
        return `streak.${key}${index}`;
    };

    const message = getRandomStreakMessageKey(isGoal ? 'goalReached' : 'message', 7);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: appear,
                    transform: [
                        {
                            translateY: appear.interpolate({
                                inputRange: [0, 1],
                                outputRange: [10, 0],
                            }),
                        },
                        {
                            scale: appear.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.96, 1],
                            }),
                        },
                    ],
                },
            ]}
        >
            {isGoal && (
                <View style={styles.goalRow}>
                    <CustomText style={styles.goalAchievedText} weight="Black">
                        {t('streak.goal_achieved')}
                    </CustomText>
                </View>
            )}

            <StreakTiles goalAchieved={isGoal} style={styles.center} value={streak} />

            <CustomText style={styles.streakLabel} weight="Bold">
                {t('streak.days_in_row')}
            </CustomText>

            <View style={styles.goalRow}>
                <CustomText style={styles.goalLeft} weight="SemiBold">
                    {streak}
                </CustomText>
                <CustomText style={styles.goalRight} weight="SemiBold">
                    {isGoal ? prev : next}
                </CustomText>
            </View>

            <View
                style={styles.progressBar}
                onLayout={e => setBarWidth(e.nativeEvent.layout.width)}
            >
                <Animated.View
                    style={[
                        styles.progressFill,
                        {
                            width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, barWidth],
                            }),
                        },
                    ]}
                />
            </View>
            <CustomText style={styles.goal}>
                {t(message, {
                    currentGoal: prev,
                    daysLeft: isGoal ? 0 : next - streak,
                    nextGoal: next,
                })}
            </CustomText>
        </Animated.View>
    );
};

const getStyles = (colors: CustomTheme['colors'], goalAchieved: boolean) =>
    StyleSheet.create({
        center: {
            alignSelf: 'center',
            marginBottom: 6,
            marginTop: 10,
        },
        container: {
            backgroundColor: colors.card,
            borderColor: colors.border,
            marginTop: 16,
            padding: 12,
        },
        goal: {
            alignSelf: 'center',
            color: goalAchieved ? colors.orange : colors.primary300,
            fontSize: 13,
            marginTop: 21,
            textAlign: 'center',
            width: '80%',
        },
        goalAchievedText: {
            color: colors.yellow,
            flex: 1,
            fontSize: 22,
            fontWeight: 'bold',
            marginVertical: 8,
            textAlign: 'center',
            textTransform: 'uppercase',
        },
        goalLeft: {
            color: goalAchieved ? colors.orange : colors.primary300,
            fontSize: 12,
            fontWeight: '800',
        },
        goalRight: {
            color: goalAchieved ? colors.orange300 : colors.primary300,
            fontSize: 12,
            fontWeight: '600',
            opacity: 0.75,
        },
        goalRow: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
            marginTop: 5,
        },
        header: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        progressBar: {
            backgroundColor: colors.background,
            height: 7,
            overflow: 'hidden',
        },
        progressFill: {
            backgroundColor: goalAchieved ? colors.orange : colors.primary300,
            height: '100%',
        },
        streakLabel: {
            color: goalAchieved ? colors.orange : colors.primary,
            fontSize: 12,
            marginTop: 5,
            textAlign: 'center',
            textTransform: 'uppercase',
        },
    });
