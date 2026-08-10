import { FC, ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { CustomTheme } from '../../Theme';

const DEFAULT_SKELETON_COUNT = 7;
const STAGGER_MS = 150;
const FADE_MS = 350;

type FlashcardsSelectionSkeletonProps = {
    count?: number;
    header?: ReactNode;
};

export const FlashcardsSelectionSkeleton: FC<FlashcardsSelectionSkeletonProps> = ({
    count = DEFAULT_SKELETON_COUNT,
    header,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);

    const anims = useRef(Array.from({ length: count }, () => new Animated.Value(0.3))).current;

    const lineWidths = useRef(
        Array.from({ length: count }, () => ({
            main: `${35 + Math.floor(Math.random() * 41)}%` as const,
            sub: `${25 + Math.floor(Math.random() * 41)}%` as const,
        })),
    ).current;

    useEffect(() => {
        const animations = anims.map((anim, i) =>
            Animated.loop(
                Animated.sequence([
                    ...(i > 0 ? [Animated.delay(i * STAGGER_MS)] : []),
                    Animated.timing(anim, { duration: FADE_MS, toValue: 1, useNativeDriver: true }),
                    Animated.timing(anim, {
                        duration: FADE_MS,
                        toValue: 0.3,
                        useNativeDriver: true,
                    }),
                    ...(i < anims.length - 1
                        ? [Animated.delay((anims.length - 1 - i) * STAGGER_MS)]
                        : []),
                ]),
            ),
        );

        animations.forEach(a => a.start());
        return () => {
            animations.forEach(a => a.stop());
        };
    }, []);

    return (
        <View style={styles.root}>
            {header}
            {anims.map((anim, i) => (
                <View key={i}>
                    <Animated.View style={[styles.item, { opacity: anim }]}>
                        <View style={styles.icon} />
                        <View style={styles.textContainer}>
                            <View style={[styles.lineMain, { width: lineWidths[i].main }]} />
                            <View style={[styles.lineSub, { width: lineWidths[i].sub }]} />
                        </View>
                        <View style={styles.checkbox} />
                    </Animated.View>
                </View>
            ))}
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        checkbox: {
            backgroundColor: colors.cardAccent,
            borderRadius: spacing.s,
            height: 20,
            marginLeft: 10,
            width: 20,
        },
        icon: {
            backgroundColor: colors.cardAccent,
            borderRadius: spacing.s,
            height: 22,
            width: 22,
        },
        item: {
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: spacing.m,
            flexDirection: 'row',
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 12,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 15,
        },
        lineMain: {
            backgroundColor: colors.cardAccent,
            borderRadius: spacing.xs,
            height: 14,
            width: '60%',
        },
        lineSub: {
            backgroundColor: colors.cardAccent,
            borderRadius: spacing.xs,
            height: 13,
            marginTop: 5,
            width: '40%',
        },
        root: {
            backgroundColor: colors.background,
        },
        textContainer: {
            flex: 1,
            marginLeft: 10,
        },
    });
