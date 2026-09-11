import { FC, useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { spacing } from '../../constants/margins';
import { CustomTheme } from '../Theme';

const FADE_MS = 600;

type SkeletonBlockProps = {
    height: number;
    style?: StyleProp<ViewStyle>;
    width: DimensionValue;
};

export const SkeletonBlock: FC<SkeletonBlockProps> = ({ height, style, width }) => {
    const { colors } = useTheme() as CustomTheme;
    const opacity = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { duration: FADE_MS, toValue: 1, useNativeDriver: true }),
                Animated.timing(opacity, { duration: FADE_MS, toValue: 0.4, useNativeDriver: true }),
            ]),
        );

        animation.start();
        return () => animation.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                styles.root,
                { backgroundColor: colors.cardAccent, height, opacity, width },
                style,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    root: {
        borderRadius: spacing.xs,
    },
});
