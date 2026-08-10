import { memo, ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { isIOS } from '../../../utils/deviceUtils';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';
import { BundleCreatorInfo } from '../home';

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
        const styles = getStyles(colors, index);
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
                    pressed && isIOS && { opacity: 0.8 },
                    style,
                ]}
                onPress={handlePress}
            >
                <View style={styles.textContainer}>
                    <CustomText numberOfLines={1} style={styles.label} weight="SemiBold">
                        {title}
                    </CustomText>
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

const getStyles = (colors: CustomTheme['colors'], index: number) =>
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
            marginTop: index === 0 ? 0 : 12,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 12,
        },
        creatorInfo: {
            marginTop: 2,
        },
        icon: {
            alignItems: 'center',
            backgroundColor: colors.cardAccent600,
            borderRadius: 100,
            height: 36,
            justifyContent: 'center',
            marginRight: MARGIN_HORIZONTAL / 2,
            width: 36,
        },
        label: {
            color: colors.white,
            fontSize: 14,
        },
        textContainer: {
            flex: 1,
        },
    });
