import React, { FC, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { CustomText } from '../../components';
import { CustomTheme } from '../../Theme';

const SKELETON_COUNT = 7;
const STAGGER_MS = 150;
const FADE_MS = 350;

export const FlashcardsSelectionSkeleton: FC = () => {
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const styles = getStyles(colors);

    const anims = useRef(
        Array.from({ length: SKELETON_COUNT }, () => new Animated.Value(0.3)),
    ).current;

    const lineWidths = useRef(
        Array.from({ length: SKELETON_COUNT }, () => ({
            main: `${35 + Math.floor(Math.random() * 41)}%` as const,
            sub: `${25 + Math.floor(Math.random() * 41)}%` as const,
        })),
    ).current;

    const textAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const textLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(textAnim, { duration: 900, toValue: 1, useNativeDriver: true }),
                Animated.timing(textAnim, { duration: 900, toValue: 0.4, useNativeDriver: true }),
            ]),
        );
        textLoop.start();

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
                    ...(i < SKELETON_COUNT - 1
                        ? [Animated.delay((SKELETON_COUNT - 1 - i) * STAGGER_MS)]
                        : []),
                ]),
            ),
        );

        animations.forEach(a => a.start());
        return () => {
            textLoop.stop();
            animations.forEach(a => a.stop());
        };
    }, []);

    return (
        <View>
            <Animated.View style={[styles.footer, { opacity: textAnim }]}>
                <CustomText style={styles.footerText} weight={'SemiBold'}>
                    {t('word_selection.searching')}
                </CustomText>
            </Animated.View>
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
                    <View style={styles.divider} />
                </View>
            ))}
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        checkbox: {
            backgroundColor: colors.cardAccent,
            height: 20,
            marginLeft: 10,
            width: 20,
        },
        divider: {
            backgroundColor: colors.background,
            height: 3,
            width: '100%',
        },
        footer: {
            alignItems: 'center',
            paddingVertical: MARGIN_VERTICAL,
        },
        footerText: {
            color: colors.primary300,
            fontSize: 13,
        },
        icon: {
            backgroundColor: colors.cardAccent,
            height: 22,
            width: 22,
        },
        item: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 15,
        },
        lineMain: {
            backgroundColor: colors.cardAccent,
            height: 14,
            width: '60%',
        },
        lineSub: {
            backgroundColor: colors.cardAccent,
            height: 13,
            marginTop: 5,
            width: '40%',
        },
        textContainer: {
            flex: 1,
            marginLeft: 10,
        },
    });
