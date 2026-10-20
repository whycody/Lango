import { memo, useCallback, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { GRADE_THREE_PROB_THRESHOLDS } from '../../../constants/Evaluation';
import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { getLevelColor } from '../../../utils/getLevelColor';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

const STAGGER_MS = 40;
const MAX_STAGGER_MS = 320;

type FlashcardListItemProps = {
    id: string;
    index?: number;
    level: number;
    onPress?: (id: string) => void;
    style?: StyleProp<ViewStyle>;
    text: string;
    translation: string;
    withContrast?: boolean;
};

export const FlashcardListItem = memo<FlashcardListItemProps>(
    ({ id, index = 0, level, onPress, style, text, translation, withContrast = false }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors, withContrast);

        const appear = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            const delay = Math.min(index * STAGGER_MS, MAX_STAGGER_MS);
            const animation = Animated.timing(appear, {
                delay,
                duration: 220,
                toValue: 1,
                useNativeDriver: true,
            });
            animation.start();
            return () => animation.stop();
        }, [appear, index]);

        const getColor = useCallback((level: number) => {
            return getLevelColor(level);
        }, []);

        const flashcardColor =
            level > GRADE_THREE_PROB_THRESHOLDS.GOOD_MIN
                ? colors.green
                : level > GRADE_THREE_PROB_THRESHOLDS.BAD_MAX
                  ? colors.yellow
                  : colors.red;

        return (
            <Animated.View
                style={{
                    opacity: appear,
                    transform: [
                        {
                            translateY: appear.interpolate({
                                inputRange: [0, 1],
                                outputRange: [8, 0],
                            }),
                        },
                    ],
                }}
            >
                <Pressable
                    android_ripple={{ color: colors.cardAccent, foreground: true }}
                    style={[styles.root, style]}
                    onPress={() => onPress?.(id)}
                >
                    <View style={[styles.container, { borderLeftColor: flashcardColor }]}>
                        <Ionicons color={getColor(level)} name={'reader'} size={22} />
                        <View style={styles.textContainer}>
                            <CustomText style={styles.text} weight={'SemiBold'}>
                                {text}
                            </CustomText>
                            <CustomText style={styles.translation}>{translation}</CustomText>
                        </View>
                        {onPress && (
                            <Ionicons
                                color={colors.white}
                                name={'information-circle-outline'}
                                size={22}
                                style={styles.icon}
                            />
                        )}
                    </View>
                </Pressable>
            </Animated.View>
        );
    },
);

const getStyles = (colors: CustomTheme['colors'], withContrast: boolean) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            borderColor: colors.yellow,
            flexDirection: 'row',
            paddingLeft: MARGIN_HORIZONTAL,
            paddingRight: MARGIN_HORIZONTAL,
            paddingVertical: 13,
        },
        icon: {
            marginLeft: 10,
            opacity: 0.8,
            padding: 5,
            paddingRight: 0,
        },
        root: {
            backgroundColor: withContrast ? colors.cardAccent : colors.card,
            borderColor: withContrast ? colors.cardAccent300 : colors.cardAccent,
            borderRadius: spacing.m,
            borderWidth: 1,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 12,
            overflow: 'hidden',
        },
        text: {
            color: colors.white,
            fontSize: 14,
        },
        textContainer: {
            flex: 1,
            marginLeft: 10,
        },
        translation: {
            color: colors.white300,
            fontSize: 13,
        },
    });
