import { FC, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { SessionLength } from '../../../constants/UserPreferences';
import { CustomText } from '..';

const RECT_HEIGHT = 13;

interface SessionLengthItemProps {
    active: boolean;
    level: SessionLength;
    onPress?: (level: number) => void;
    style?: StyleProp<ViewStyle>;
}

export const WordLevelItem: FC<SessionLengthItemProps> = ({ active, level, onPress, style }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors, level);
    const { t } = useTranslation();

    const [gradientColors, setGradientColors] = useState<[string, string, ...string[]]>([
        colors.background,
        colors.card,
    ]);

    const rectangles = [
        {
            jump: useRef(new Animated.Value(0)).current,
            scale: useRef(new Animated.Value(1)).current,
            spread: useRef(new Animated.Value(0)).current,
        },
        {
            jump: useRef(new Animated.Value(0)).current,
            scale: useRef(new Animated.Value(1)).current,
            spread: useRef(new Animated.Value(0)).current,
        },
        { jump: null, scale: null, spread: null },
    ];

    const handlePressIn = () => {
        const color =
            level > SessionLength.MEDIUM
                ? colors.green300
                : level > SessionLength.SHORT
                  ? colors.yellow300
                  : colors.red300;
        setGradientColors([color, colors.card]);

        Animated.parallel([
            Animated.spring(rectangles[0].scale!, {
                toValue: 1.1,
                useNativeDriver: true,
            }),
            Animated.spring(rectangles[1].scale!, {
                toValue: 1.05,
                useNativeDriver: true,
            }),
            Animated.spring(rectangles[0].spread!, {
                toValue: -2,
                useNativeDriver: true,
            }),
            Animated.spring(rectangles[1].spread!, {
                toValue: -0.5,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        setGradientColors([colors.background, colors.card]);

        Animated.parallel([
            Animated.spring(rectangles[0].scale!, {
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.spring(rectangles[1].scale!, {
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.spring(rectangles[0].spread!, {
                toValue: 0,
                useNativeDriver: true,
            }),
            Animated.spring(rectangles[1].spread!, {
                toValue: 0,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePress = () => {
        const jump = (anim: Animated.Value, height: number) =>
            Animated.sequence([
                Animated.timing(anim, {
                    duration: 160,
                    easing: Easing.out(Easing.cubic),
                    toValue: -height,
                    useNativeDriver: true,
                }),
                Animated.spring(anim, {
                    bounciness: 4,
                    speed: 18,
                    toValue: 0,
                    useNativeDriver: true,
                }),
            ]);

        Animated.parallel([jump(rectangles[0].jump!, 2), jump(rectangles[1].jump!, 1)]).start();

        onPress?.(level);
    };

    return (
        <LinearGradient
            colors={gradientColors}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={style}
        >
            <Pressable
                style={styles.root}
                onPress={active ? handlePress : undefined}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <View style={styles.rectanglesContainer}>
                    {rectangles.map((r, i) =>
                        r.scale ? (
                            <Animated.View
                                key={i}
                                style={[
                                    styles.rectangle,
                                    {
                                        opacity:
                                            i === 0
                                                ? level > SessionLength.MEDIUM
                                                    ? 1
                                                    : 0.2
                                                : i === 1
                                                  ? level > SessionLength.SHORT
                                                      ? 1
                                                      : 0.2
                                                  : 1,
                                        transform: [
                                            { translateY: Animated.add(r.spread!, r.jump!) },
                                            { scaleY: r.scale },
                                        ],
                                    },
                                ]}
                            />
                        ) : (
                            <View key={i} style={[styles.rectangle, { opacity: 1 }]} />
                        ),
                    )}
                </View>

                <CustomText style={styles.title} weight="Bold">
                    {t(
                        level === SessionLength.SHORT
                            ? 'poorly'
                            : level === SessionLength.MEDIUM
                              ? 'moderately'
                              : 'good',
                    )}
                </CustomText>
            </Pressable>
        </LinearGradient>
    );
};

const getStyles = (colors: any, level: number) =>
    StyleSheet.create({
        rectangle: {
            backgroundColor:
                level > SessionLength.MEDIUM
                    ? colors.green600
                    : level > SessionLength.SHORT
                      ? colors.yellow600
                      : colors.red600,
            height: RECT_HEIGHT,
            marginTop: 2,
            width: 40,
        },
        rectanglesContainer: {
            alignItems: 'center',
        },
        root: {
            paddingBottom: MARGIN_HORIZONTAL - 3,
            paddingTop: MARGIN_HORIZONTAL,
        },
        title: {
            color: colors.primary300,
            fontSize: 11,
            marginTop: 8,
            textAlign: 'center',
        },
    });
