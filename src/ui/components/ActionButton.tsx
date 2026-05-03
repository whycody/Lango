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

import { useHaptics } from '../../hooks';
import { CustomTheme } from '../Theme';
import { CustomText } from './CustomText';

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
    primary = false,
    style,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors, primary, active);
    const { triggerHaptics } = useHaptics();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        triggerHaptics('rigid');
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
                android_ripple={{ color: primary ? 'white' : colors.card, foreground: true }}
                style={[styles.root, style]}
                onPress={active && !loading ? handlePress : undefined}
                onPressIn={active && !loading ? handlePressIn : undefined}
                onPressOut={active && !loading ? handlePressOut : undefined}
            >
                <CustomText style={[styles.label, loading && styles.hidden]} weight={'Bold'}>
                    {label}
                </CustomText>
                {icon && (
                    <Ionicons
                        color={primary ? colors.card : colors.primary}
                        name={icon}
                        size={14}
                        style={[styles.icon, loading && styles.hidden]}
                    />
                )}
                {loading && (
                    <ActivityIndicator
                        color={primary ? colors.card : colors.primary}
                        size="small"
                        style={StyleSheet.absoluteFill}
                    />
                )}
            </Pressable>
        </Animated.View>
    );
};

const getStyles = (colors: CustomTheme['colors'], primary: boolean, active: boolean) =>
    StyleSheet.create({
        hidden: {
            opacity: 0,
        },
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
