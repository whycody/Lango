import { FC, memo, ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../../constants/margins';
import { fontSize } from '../../../../constants/typography';
import { useHaptics } from '../../../../hooks';
import { ThemeColors } from '../../../../types';
import { CustomText } from '../../../../ui/components';
import { CustomTheme } from '../../../../ui/Theme';
import { isIOS } from '../../../../utils/deviceUtils';
import { BundleCreatorInfo } from './bundle-creator-info';
import { PremiumBadge } from './premium-badge';

interface BundleCardItemProps {
    actionSlot?: ReactNode;
    creatorName?: string;
    flashcardsCount: number;
    index: number;
    isPremium?: boolean;
    onPress?: () => void;
    ownerId: string;
    style?: ViewStyle;
    title: string;
}

export const BundleCardItem: FC<BundleCardItemProps> = memo(
    ({
        actionSlot,
        creatorName,
        flashcardsCount,
        index,
        isPremium = false,
        onPress,
        ownerId,
        style,
        title,
    }) => {
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
                    <View style={styles.metaRow}>
                        <BundleCreatorInfo
                            compact
                            creatorId={ownerId}
                            flashcardsCount={flashcardsCount}
                            name={creatorName}
                            style={styles.creatorInfo}
                        />
                        {isPremium && <PremiumBadge style={styles.premiumBadge} />}
                    </View>
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
            borderRadius: spacing.m,
            borderWidth: 1,
            flexDirection: 'row',
            marginTop: spacing.l,
            overflow: 'hidden',
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: spacing.l,
        },
        creatorInfo: {
            flexShrink: 1,
            marginTop: spacing.none,
        },
        firstContainer: {
            marginTop: spacing.none,
        },
        label: {
            color: colors.white,
            fontSize: fontSize.l,
        },
        metaRow: {
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: spacing.s,
        },
        premiumBadge: {
            alignSelf: 'center',
            flexShrink: 0,
            marginLeft: spacing.m,
        },
        pressed: {
            opacity: 0.8,
        },
        textContainer: {
            flex: 1,
        },
    });
