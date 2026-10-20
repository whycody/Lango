import { FC, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../../constants/margins';
import { ThemeColors } from '../../../../types';
import { CustomTheme } from '../../../../ui/Theme';
import {
    MEMBER_AVATAR_SIZE,
    MEMBER_SKELETON_FADE_MS,
    MEMBER_SKELETON_NAME_LINE_HEIGHT,
    MEMBER_SKELETON_NAME_WIDTH,
    MEMBER_SKELETON_OPACITY_MAX,
    MEMBER_SKELETON_OPACITY_MIN,
    MEMBER_SKELETON_ROLE_LINE_HEIGHT,
    MEMBER_SKELETON_ROLE_WIDTH,
    MEMBER_SKELETON_ROW_COUNT,
    MEMBER_SKELETON_STAGGER_MS,
} from '../constants';

export const MembersListSkeleton: FC = () => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);

    const anims = useRef(
        Array.from(
            { length: MEMBER_SKELETON_ROW_COUNT },
            () => new Animated.Value(MEMBER_SKELETON_OPACITY_MIN),
        ),
    ).current;

    useEffect(() => {
        const animations = anims.map((anim, index) =>
            Animated.loop(
                Animated.sequence([
                    ...(index > 0 ? [Animated.delay(index * MEMBER_SKELETON_STAGGER_MS)] : []),
                    Animated.timing(anim, {
                        duration: MEMBER_SKELETON_FADE_MS,
                        toValue: MEMBER_SKELETON_OPACITY_MAX,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        duration: MEMBER_SKELETON_FADE_MS,
                        toValue: MEMBER_SKELETON_OPACITY_MIN,
                        useNativeDriver: true,
                    }),
                    ...(index < anims.length - 1
                        ? [Animated.delay((anims.length - 1 - index) * MEMBER_SKELETON_STAGGER_MS)]
                        : []),
                ]),
            ),
        );

        animations.forEach(animation => animation.start());
        return () => animations.forEach(animation => animation.stop());
    }, [anims]);

    return (
        <View>
            {anims.map((anim, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.container,
                        index === 0 && styles.firstContainer,
                        { opacity: anim },
                    ]}
                >
                    <View style={styles.avatar} />
                    <View style={styles.textContainer}>
                        <View style={styles.name} />
                        <View style={styles.role} />
                    </View>
                </Animated.View>
            ))}
        </View>
    );
};

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        avatar: {
            backgroundColor: colors.cardAccent,
            borderRadius: spacing.m,
            height: MEMBER_AVATAR_SIZE,
            width: MEMBER_AVATAR_SIZE,
        },
        container: {
            alignItems: 'center',
            backgroundColor: colors.card,
            borderColor: colors.cardAccent300,
            borderRadius: spacing.l,
            borderWidth: 1,
            flexDirection: 'row',
            marginTop: spacing.l,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: spacing.l,
        },
        firstContainer: {
            marginTop: spacing.m,
        },
        name: {
            backgroundColor: colors.cardAccent,
            borderRadius: spacing.xs,
            height: MEMBER_SKELETON_NAME_LINE_HEIGHT,
            width: MEMBER_SKELETON_NAME_WIDTH,
        },
        role: {
            backgroundColor: colors.cardAccent,
            borderRadius: spacing.xs,
            height: MEMBER_SKELETON_ROLE_LINE_HEIGHT,
            marginTop: spacing.xxs,
            width: MEMBER_SKELETON_ROLE_WIDTH,
        },
        textContainer: {
            marginLeft: spacing.l,
        },
    });
