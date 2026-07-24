import { memo } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { EnrichedWordsBundle } from '../../../store/WordsBundleContext';
import { isIOS } from '../../../utils/deviceUtils';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

const VISIBILITY_ICON: Record<EnrichedWordsBundle['visibility'], keyof typeof Ionicons.glyphMap> = {
    friends: 'people',
    private: 'lock-closed',
    public: 'globe',
};

interface BundleItemProps {
    bundle: EnrichedWordsBundle;
    index: number;
    onPress?: (bundle: EnrichedWordsBundle) => void;
    style?: ViewStyle;
}

export const BundleItem = memo<BundleItemProps>(({ bundle, index, onPress, style }) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors, index);
    const { triggerHaptics } = useHaptics();

    const handlePress = () => {
        onPress?.(bundle);
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
            <Ionicons
                color={colors.primary300}
                name={VISIBILITY_ICON[bundle.visibility]}
                size={24}
                style={styles.icon}
            />
            <View style={styles.textContainer}>
                <CustomText style={styles.label} weight="SemiBold">
                    {bundle.title}
                </CustomText>
                {bundle.description && (
                    <CustomText style={styles.description} weight="Regular">
                        {bundle.description}
                    </CustomText>
                )}
            </View>
            {bundle.membership?.role && (
                <CustomText style={styles.role} weight="Regular">
                    {bundle.membership.role}
                </CustomText>
            )}
        </Pressable>
    );
});

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
        role: {
            color: colors.white,
            fontSize: 12,
            opacity: 0.6,
            textTransform: 'capitalize',
        },
        root: {
            alignItems: 'center',
            backgroundColor: colors.card,
            borderColor: colors.cardAccent300,
            borderRadius: spacing.m,
            borderWidth: 1,
            flexDirection: 'row',
            marginTop: index === 0 ? 0 : 12,
            overflow: 'hidden',
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 12,
        },
        textContainer: {
            flex: 1,
        },
    });
