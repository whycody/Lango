import React, { FC, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { spacing } from '../../../constants/margins';
import {
    DIGITS,
    STREAK_ANIMATIONS_DELAY,
    TILE_HEIGHT,
    TILE_WIDTH,
} from '../../../constants/Streak';
import { useHaptics } from '../../../hooks/useHaptics';
import { CustomTheme } from '../../Theme';

type DigitTileProps = {
    digit: number;
    index: number;
    faded: boolean;
    goalAchieved?: boolean;
};

const DigitTile = ({ digit, faded, goalAchieved, index }: DigitTileProps) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors, goalAchieved), [colors, goalAchieved]);
    const { triggerHaptics } = useHaptics();

    useEffect(() => {
        translateY.setValue(0);

        let lastStep = 0;
        const listenerId = translateY.addListener(({ value }) => {
            const step = Math.round(-value / TILE_HEIGHT);
            if (step > lastStep) {
                lastStep = step;
                triggerHaptics('soft');
            }
        });

        Animated.sequence([
            Animated.delay(STREAK_ANIMATIONS_DELAY + index * 80),
            Animated.timing(translateY, {
                duration: digit * 120,
                toValue: -digit * TILE_HEIGHT,
                useNativeDriver: true,
            }),
        ]).start(() => {
            translateY.removeListener(listenerId);
        });

        return () => {
            translateY.removeListener(listenerId);
        };
    }, [digit]);

    return (
        <View style={[styles.tile, goalAchieved && { backgroundColor: colors.yellow300 }]}>
            <Animated.View style={{ transform: [{ translateY }] }}>
                {DIGITS.map(d => (
                    <View key={d} style={styles.row}>
                        <View style={styles.box}>
                            <Animated.Text
                                style={[
                                    styles.digit,
                                    {
                                        color: goalAchieved ? colors.yellow : colors.orange,
                                        opacity: faded && d === 0 ? 0.25 : 1,
                                    },
                                ]}
                            >
                                {d}
                            </Animated.Text>
                        </View>
                    </View>
                ))}
            </Animated.View>
        </View>
    );
};

type StreakTilesProps = {
    value: number;
    goalAchieved?: boolean;
    style?: StyleProp<ViewStyle>;
};

export const StreakTiles: FC<StreakTilesProps> = ({ goalAchieved, style, value }) => {
    const digits = useMemo(() => String(value).split('').map(Number), [value]);
    const tileCount = Math.max(3, digits.length + 1);
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors, goalAchieved), [colors, goalAchieved]);

    const padded = useMemo(() => {
        const arr = [...digits];

        while (arr.length < tileCount) {
            arr.unshift(0);
        }

        return arr.slice(-tileCount);
    }, [digits, tileCount]);

    return (
        <View style={[styles.container, style]}>
            {padded.map((d, i) => {
                const isLeadingZero = i < padded.length - digits.length;

                return (
                    <DigitTile
                        key={i}
                        digit={d}
                        faded={isLeadingZero}
                        goalAchieved={goalAchieved}
                        index={i}
                    />
                );
            })}
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors'], goalAchieved?: boolean) =>
    StyleSheet.create({
        box: {
            alignItems: 'center',
            height: TILE_HEIGHT,
            justifyContent: 'center',
            width: TILE_WIDTH,
        },
        container: {
            flexDirection: 'row',
            gap: 6,
        },
        digit: {
            color: colors.white,
            fontSize: 24,
            fontWeight: '900',
        },
        row: {
            alignItems: 'center',
            height: TILE_HEIGHT,
            justifyContent: 'center',
        },
        tile: {
            backgroundColor: goalAchieved ? colors.orange600 : colors.red300,
            borderRadius: spacing.s,
            height: TILE_HEIGHT,
            overflow: 'hidden',
            width: TILE_WIDTH,
        },
    });
