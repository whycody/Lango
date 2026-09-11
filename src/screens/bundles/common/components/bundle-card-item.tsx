import { memo, ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../../constants/margins';
import { useHaptics } from '../../../../hooks';
import { ThemeColors } from '../../../../types';
import { CustomText } from '../../../../ui/components';
import { BundleCreatorInfo } from '../../../../ui/components/home';
import { CustomTheme } from '../../../../ui/Theme';
import { isIOS } from '../../../../utils/deviceUtils';

interface BundleCardItemProps {
    actionSlot?: ReactNode;
    creatorName?: string;
    flashcardsCount: number;
    index: number;
    onPress?: () => void;
    ownerId: string;
    style?: ViewStyle;
    title: string;
}

export const BundleCardItem = memo<BundleCardItemProps>(
    ({ actionSlot, creatorName, flashcardsCount, index, onPress, ownerId, style, title }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = useMemo(() => getStyles(colors), [colors]);
        const { triggerHaptics } = useHaptics();

        const handlePress = () => {
            onPress?.();
            triggerHaptics('light');
        };

        return (
            <Pressable
                android_ripple={{
                    color: colors.cardAccent300,
                    foreground: true,
                }}
                style={({ pressed }) => [
                    styles.container,
                    index === 0 && styles.firstContainer,
                    pressed && isIOS && styles.pressed,
                    style,
                ]}
                onPress={handlePress}
            >
                <View style={styles.textContainer}>
                    <CustomText
                        numberOfLines={1}
                        style={styles.label}
                        text={title}
                        weight="SemiBold"
                    />
                    <BundleCreatorInfo
                        compact
                        creatorId={ownerId}
                        flashcardsCount={flashcardsCount}
                        name={creatorName}
                        style={styles.creatorInfo}
                    />
                </View>
                {actionSlot && <View style={styles.actionSlotContainer}>{actionSlot}</View>}
            </Pressable>
        );
    },
);

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        actionSlotContainer: {
            alignItems: 'center',
            flexShrink: 0,
            justifyContent: 'center',
            marginLeft: MARGIN_HORIZONTAL,
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
        creatorInfo: {
            marginTop: spacing.xxs,
        },
        firstContainer: {
            marginTop: spacing.none,
        },
        label: {
            color: colors.white,
            fontSize: 14,
        },
        pressed: {
            opacity: 0.8,
        },
        textContainer: {
            flex: 1,
        },
    });
