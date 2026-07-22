import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { t } from 'i18next';
import LottieView from 'lottie-react-native';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { getNextMilestone, getPrevMilestone } from '../../../utils/streakUtils';
import { CustomTheme } from '../../Theme';
import { CustomText, ProgressBar } from '..';
import { StreakTiles } from './StreakTiles';

type StreakBadgeProps = {
    animate?: boolean;
    streak: number;
};

export const StreakBadge = ({ animate = false, streak }: StreakBadgeProps) => {
    const { colors } = useTheme() as CustomTheme;
    const appear = useRef(new Animated.Value(0)).current;

    const next = getNextMilestone(streak);
    const prev = getPrevMilestone(streak);

    const isGoal = streak === prev;
    const progressAnim = useRef(new Animated.Value(0)).current;

    const styles = useMemo(() => getStyles(colors, isGoal), [colors, isGoal]);

    useEffect(() => {
        if (!animate) return;
        const target = isGoal ? 1 : next ? (streak - prev) / (next - prev) : 1;
        progressAnim.stopAnimation(() => {
            progressAnim.setValue(0);
            Animated.timing(progressAnim, {
                duration: 700,
                toValue: target,
                useNativeDriver: false,
            }).start();
        });
    }, [streak, next, prev, isGoal, animate]);

    useEffect(() => {
        Animated.spring(appear, {
            friction: 7,
            tension: 70,
            toValue: 1,
            useNativeDriver: true,
        }).start();
    }, [animate]);

    const getRandomStreakMessageKey = (key: string, count: number) => {
        const index = Math.floor(Math.random() * count) + 1;
        return `streak.${key}${index}`;
    };

    const message = useMemo(
        () => getRandomStreakMessageKey(isGoal ? 'goalReached' : 'message', 7),
        [isGoal],
    );

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
            <LottieView
                autoPlay={true}
                cacheComposition={false}
                loop={true}
                source={require('../../../../assets/fire.json')}
                style={styles.lottie}
            />
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

            <ProgressBar
                color={isGoal ? colors.yellow : colors.orange}
                progress={progressAnim}
            />
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
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 16,
        },
        goal: {
            alignSelf: 'center',
            color: goalAchieved ? colors.orange : colors.white300,
            fontSize: 13,
            marginTop: 21,
            textAlign: 'center',
            width: '80%',
        },
        goalAchievedText: {
            color: colors.yellow,
            flex: 1,
            fontSize: 22,
            marginBottom: 8,
            marginTop: 8,
            textAlign: 'center',
            textTransform: 'uppercase',
        },
        goalLeft: {
            color: goalAchieved ? colors.orange : colors.white300,
            fontSize: 12,
        },
        goalRight: {
            color: goalAchieved ? colors.orange300 : colors.white300,
            fontSize: 12,
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
        lottie: {
            height: 140,
            marginTop: -15,
            pointerEvents: 'none',
        },
        streakLabel: {
            color: goalAchieved ? colors.yellow : colors.orange,
            fontSize: 12,
            marginTop: 5,
            textAlign: 'center',
            textTransform: 'uppercase',
        },
    });
