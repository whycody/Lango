import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { spacing } from '../../constants/margins';
import { CustomTheme } from '../Theme';

type ProgressBarProps = {
    color?: string;
    height?: number;
    progress: Animated.Value | number;
    style?: StyleProp<ViewStyle>;
    trackColor?: string;
};

export const ProgressBar = ({
    color,
    height = 7,
    progress,
    style,
    trackColor,
}: ProgressBarProps) => {
    const { colors } = useTheme() as CustomTheme;
    const [barWidth, setBarWidth] = useState(0);
    const animatedProgress = useRef(new Animated.Value(0)).current;

    const styles = useMemo(
        () => getStyles(height, trackColor ?? colors.background, color ?? colors.orange),
        [height, trackColor, color, colors],
    );

    useEffect(() => {
        if (progress instanceof Animated.Value) return;
        Animated.timing(animatedProgress, {
            duration: 400,
            toValue: Math.max(0, Math.min(1, progress)),
            useNativeDriver: false,
        }).start();
    }, [progress, animatedProgress]);

    const width = (progress instanceof Animated.Value ? progress : animatedProgress).interpolate({
        inputRange: [0, 1],
        outputRange: [0, barWidth],
    });

    return (
        <Animated.View
            style={[styles.track, style]}
            onLayout={e => setBarWidth(e.nativeEvent.layout.width)}
        >
            <Animated.View style={[styles.fill, { width }]} />
        </Animated.View>
    );
};

const getStyles = (height: number, trackColor: string, fillColor: string) =>
    StyleSheet.create({
        fill: {
            backgroundColor: fillColor,
            height: '100%',
        },
        track: {
            backgroundColor: trackColor,
            borderRadius: spacing.m,
            height,
            overflow: 'hidden',
        },
    });
