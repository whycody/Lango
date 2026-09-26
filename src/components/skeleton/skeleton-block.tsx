import { FC, useEffect, useMemo, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { spacing } from '../../constants/margins';
import { ThemeColors } from '../../types';
import { CustomTheme } from '../../ui/Theme';

const FADE_MS = 600;
const OPACITY_MIN = 0.4;
const OPACITY_MAX = 1;

type SkeletonBlockProps = {
    height: number;
    style?: StyleProp<ViewStyle>;
    width: DimensionValue;
};

export const SkeletonBlock: FC<SkeletonBlockProps> = ({ height, style, width }) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors), [colors]);
    const opacity = useRef(new Animated.Value(OPACITY_MIN)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    duration: FADE_MS,
                    toValue: OPACITY_MAX,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    duration: FADE_MS,
                    toValue: OPACITY_MIN,
                    useNativeDriver: true,
                }),
            ]),
        );

        animation.start();
        return () => animation.stop();
    }, [opacity]);

    return <Animated.View style={[styles.root, { height, opacity, width }, style]} />;
};

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        root: {
            backgroundColor: colors.cardAccent,
            borderRadius: spacing.xs,
        },
    });
