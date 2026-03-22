import React, { FC, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    Pressable,
    StyleProp,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { useHaptics } from '../../hooks';
import { CustomText } from '.';

interface ActionButtonProps {
    active?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    label: string;
    loading?: boolean;
    onPress?: () => void;
    primary?: boolean;
    style?: StyleProp<ViewStyle>;
}

export const ActionButton: FC<ActionButtonProps> = ({
    active = true,
    icon,
    label,
    loading = false,
    onPress,
    primary,
    style,
}) => {
    const { colors } = useTheme();
    const styles = getStyles(colors, primary, active);
    const { triggerHaptics } = useHaptics();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        triggerHaptics(Haptics.ImpactFeedbackStyle.Rigid);
        onPress?.();
    };

    const handlePressIn = () => {
        scaleAnim.setValue(1);
        opacityAnim.setValue(1);

        Animated.parallel([
            Animated.timing(scaleAnim, {
                duration: 100,
                easing: Easing.out(Easing.quad),
                toValue: 0.95,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                duration: 100,
                easing: Easing.out(Easing.quad),
                toValue: 0.7,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                friction: 8,
                tension: 40,
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                duration: 100,
                easing: Easing.out(Easing.quad),
                toValue: 1,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <Animated.View
            style={{
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
            }}
        >
            <Pressable
                android_ripple={{ color: primary ? 'white' : colors.card }}
                style={[styles.root, style]}
                onPress={active && !loading ? handlePress : undefined}
                onPressIn={active && !loading ? handlePressIn : undefined}
                onPressOut={active && !loading ? handlePressOut : undefined}
            >
                {loading ? (
                    <ActivityIndicator
                        color={primary ? colors.card : colors.primary}
                        size="small"
                    />
                ) : (
                    <>
                        <CustomText style={styles.label} weight={'Bold'}>
                            {label}
                        </CustomText>
                        {icon && (
                            <Ionicons
                                color={primary ? colors.card : colors.primary}
                                name={icon}
                                size={14}
                                style={styles.icon}
                            />
                        )}
                    </>
                )}
            </Pressable>
        </Animated.View>
    );
};

const getStyles = (colors: any, primary: boolean, active: boolean) =>
    StyleSheet.create({
        icon: {
            marginLeft: 4,
            marginTop: 2,
        },
        label: {
            color: primary ? colors.card : colors.primary,
            fontSize: 13,
        },
        root: {
            alignItems: 'center',
            backgroundColor: primary ? colors.primary : undefined,
            borderColor: colors.cardAccent,
            borderWidth: primary ? 0 : 2,
            flexDirection: 'row',
            justifyContent: 'center',
            opacity: active ? 1 : 0.5,
            paddingHorizontal: 24,
            paddingVertical: primary ? 14 : 12,
        },
    });
