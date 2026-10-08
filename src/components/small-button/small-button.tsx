import { FC, useMemo } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { spacing } from '../../constants/margins';
import { fontSize } from '../../constants/typography';
import { useHaptics } from '../../hooks';
import { TranslationKey } from '../../types';
import { CustomText } from '../../ui/components';
import { CustomTheme } from '../../ui/Theme';

interface SmallButtonProps {
    color?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    label?: string;
    labelColor?: string;
    labelTx?: TranslationKey;
    onPress?: () => void;
    rippleColor?: string;
    style?: StyleProp<ViewStyle>;
}

export const SmallButton: FC<SmallButtonProps> = ({
    color,
    icon,
    label,
    labelColor,
    labelTx,
    onPress,
    rippleColor,
    style,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const { triggerHaptics } = useHaptics();
    const resolvedColor = color ?? colors.white;
    const resolvedLabelColor = labelColor ?? colors.primary;
    const styles = useMemo(() => getStyles(resolvedColor), [resolvedColor]);

    const handlePress = () => {
        triggerHaptics('rigid');
        onPress?.();
    };

    return (
        <Pressable
            android_ripple={{ color: rippleColor ?? colors.primary600, foreground: true }}
            style={({ pressed }) => [styles.root, pressed && styles.pressed, style]}
            onPress={handlePress}
        >
            <CustomText
                style={[styles.label, { color: resolvedLabelColor }]}
                tx={labelTx}
                weight="Bold"
            >
                {label}
            </CustomText>
            {icon && (
                <Ionicons color={resolvedLabelColor} name={icon} size={14} style={styles.icon} />
            )}
        </Pressable>
    );
};

const getStyles = (color: string) =>
    StyleSheet.create({
        icon: {
            marginLeft: spacing.s,
        },
        label: {
            fontSize: fontSize.m,
        },
        pressed: {
            opacity: 0.8,
        },
        root: {
            alignItems: 'center',
            alignSelf: 'flex-start',
            backgroundColor: color,
            borderRadius: spacing.m,
            flexDirection: 'row',
            overflow: 'hidden',
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.m,
        },
    });
