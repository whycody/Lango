import { memo } from 'react';
import { Pressable, StyleSheet, Switch, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { TranslationKey } from '../../../types';
import { isIOS } from '../../../utils/deviceUtils';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

interface LibraryItemProps {
    description?: string;
    descriptionTx?: TranslationKey;
    enabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    index: number;
    label?: string;
    labelTx?: TranslationKey;
    color?: string;
    onPress?: () => void;
    style?: ViewStyle;
}

export const LibraryItem = memo<LibraryItemProps>(
    ({ color, description, descriptionTx, enabled, icon, index, label, labelTx, onPress, style }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors, index);
        const { triggerHaptics } = useHaptics();
        const { t } = useTranslation();

        const resolvedLabel = labelTx ? t(labelTx) : label;
        const resolvedDescription = descriptionTx ? t(descriptionTx) : description;

        const handlePress = () => {
            onPress?.();
            triggerHaptics('light');
        };

        return (
            <Pressable
                style={({ pressed }) => [styles.root, pressed && isIOS && { opacity: 0.8 }, style]}
                android_ripple={{
                    color: colors.cardAccent300,
                    foreground: true,
                }}
                onPress={handlePress}
            >
                {icon && (
                    <Ionicons
                        color={color ? color : colors.primary300}
                        name={icon}
                        size={24}
                        style={styles.icon}
                    />
                )}
                <View style={styles.textContainer}>
                    <CustomText style={styles.label} weight={'SemiBold'}>
                        {resolvedLabel}
                    </CustomText>
                    {resolvedDescription && (
                        <CustomText style={styles.description} weight={'Regular'}>
                            {resolvedDescription}
                        </CustomText>
                    )}
                </View>
                {enabled !== undefined && (
                    <View style={styles.switchContainer}>
                        <Switch
                            thumbColor={isIOS ? undefined : colors.white}
                            trackColor={isIOS ? undefined : { true: colors.primary }}
                            value={enabled}
                            onValueChange={handlePress}
                        />
                    </View>
                )}
            </Pressable>
        );
    },
);

const getStyles = (colors: CustomTheme['colors'], index: number) =>
    StyleSheet.create({
        description: {
            color: colors.white,
            fontSize: 12,
            opacity: 0.7,
        },
        icon: {
            marginRight: 12,
        },
        label: {
            color: colors.white,
            fontSize: 14,
        },
        root: {
            alignItems: 'center',
            backgroundColor: colors.card,
            borderColor: colors.cardAccent300,
            borderRadius: spacing.m,
            borderWidth: 1,
            flexDirection: 'row',
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: index === 0 ? 0 : 12,
            overflow: 'hidden',
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 12,
        },
        switchContainer: {
            justifyContent: 'center',
        },
        textContainer: {
            flex: 1,
        },
    });
