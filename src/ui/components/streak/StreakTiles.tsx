import React, { FC, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import {
    DIGITS,
    STREAK_ANIMATIONS_DELAY,
    TILE_HEIGHT,
    TILE_WIDTH,
} from '../../../constants/Streak';
import { CustomTheme } from '../../Theme';

type DigitTileProps = {
    digit: number;
    faded: boolean;
    goalAchieved?: boolean;
};

const DigitTile = ({ digit, faded, goalAchieved }: DigitTileProps) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors, goalAchieved), [colors, goalAchieved]);

    useEffect(() => {
        Animated.sequence([
            Animated.delay(STREAK_ANIMATIONS_DELAY),
            Animated.timing(translateY, {
                duration: STREAK_ANIMATIONS_DELAY,
                toValue: -digit * TILE_HEIGHT,
                useNativeDriver: true,
            }),
        ]).start();
    }, [digit]);

    return (
        <View style={styles.tile}>
            <Animated.View style={{ transform: [{ translateY }] }}>
                {DIGITS.map(d => (
                    <View key={d} style={styles.row}>
                        <View style={styles.box}>
                            <Animated.Text
                                style={[
                                    styles.digit,
                                    {
                                        color: goalAchieved ? colors.yellow : 'white',
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
            color: '#fff',
            fontSize: 24,
            fontWeight: '900',
        },
        row: {
            alignItems: 'center',
            height: TILE_HEIGHT,
            justifyContent: 'center',
        },
        tile: {
            backgroundColor: goalAchieved ? colors.orange600 : colors.cardAccent600,
            height: TILE_HEIGHT,
            overflow: 'hidden',
            width: TILE_WIDTH,
        },
    });
