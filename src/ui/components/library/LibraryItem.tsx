import { memo } from 'react';
import { Pressable, StyleSheet, Switch, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { isIOS } from '../../../utils/deviceUtils';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

interface LibraryItemProps {
    description?: string;
    enabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    index: number;
    label: string;
    color?: string;
    onPress?: () => void;
    style?: ViewStyle;
}

export const LibraryItem = memo<LibraryItemProps>(
    ({ color, description, enabled, icon, index, label, onPress, style }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);
        const { triggerHaptics } = useHaptics();

        const handlePress = () => {
            onPress?.();
            triggerHaptics('light');
        };

        return (
            <Pressable
                style={({ pressed }) => [styles.root, pressed && isIOS && { opacity: 0.8 }, style]}
                android_ripple={{
                    color: index % 2 === 0 ? colors.card : colors.background,
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
                        {label}
                    </CustomText>
                    {description && (
                        <CustomText style={styles.description} weight={'Regular'}>
                            {description}
                        </CustomText>
                    )}
                </View>
                {enabled !== undefined && (
                    <Switch
                        thumbColor={colors.primary}
                        value={enabled}
                        onValueChange={handlePress}
                    />
                )}
            </Pressable>
        );
    },
);

const getStyles = (colors: CustomTheme['colors']) =>
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
            borderRadius: 8,
            borderWidth: 1,
            flexDirection: 'row',
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 12,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 16,
        },
        textContainer: {
            flex: 1,
        },
    });
