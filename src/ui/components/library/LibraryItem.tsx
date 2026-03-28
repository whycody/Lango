import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Switch, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { CustomText } from '..';

interface LibraryItemProps {
    description?: string;
    enabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    index: number;
    label: string;
    onPress?: () => void;
    style?: ViewStyle;
}

export const LibraryItem = memo<LibraryItemProps>(
    ({ description, enabled, icon, index, label, onPress, style }) => {
        const { colors } = useTheme();
        const styles = getStyles(colors, index);
        const { triggerHaptics } = useHaptics();

        const handlePress = () => {
            onPress?.();
            triggerHaptics('light');
        };

        return (
            <Pressable
                android_ripple={{
                    color: index % 2 === 0 ? colors.card : colors.background,
                }}
                style={({ pressed }) => [
                    styles.root,
                    pressed && Platform.OS === 'ios' && { opacity: 0.8 },
                    style,
                ]}
                onPress={handlePress}
            >
                {icon && (
                    <Ionicons color={colors.primary300} name={icon} size={24} style={styles.icon} />
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

const getStyles = (colors: any, index: number) =>
    StyleSheet.create({
        description: {
            color: colors.primary600,
            fontSize: 12,
        },
        icon: {
            marginRight: 12,
        },
        label: {
            color: colors.primary300,
            fontSize: 14,
        },
        root: {
            alignItems: 'center',
            backgroundColor: index % 2 === 0 ? colors.background : colors.card,
            flexDirection: 'row',
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 18,
        },
        textContainer: {
            flex: 1,
        },
    });
