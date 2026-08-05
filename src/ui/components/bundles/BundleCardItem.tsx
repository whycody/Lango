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
    description?: string;
    flashcardsCount: number;
    index: number;
    metaSlot?: ReactNode;
    onPress?: () => void;
    ownerId: string;
    style?: ViewStyle;
    title: string;
}

export const BundleCardItem = memo<BundleCardItemProps>(
    ({
        actionSlot,
        creatorName,
        description,
        flashcardsCount,
        index,
        metaSlot,
        onPress,
        ownerId,
        style,
        title,
    }) => {
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
                <View style={styles.root}>
                    <View style={styles.textContainer}>
                        <CustomText numberOfLines={1} style={styles.label} weight="SemiBold">
                            {title}
                        </CustomText>
                        {description && (
                            <CustomText
                                numberOfLines={1}
                                style={styles.description}
                                weight="Regular"
                            >
                                {description}
                            </CustomText>
                        )}
                    </View>
                    {actionSlot && <View style={styles.actionSlotContainer}>{actionSlot}</View>}
                </View>
                <View style={styles.metaRow}>
                    <BundleCreatorInfo
                        compact
                        creatorId={ownerId}
                        flashcardsCount={flashcardsCount}
                        name={creatorName}
                        style={styles.creatorInfo}
                    />
                    {metaSlot}
                </View>
            </Pressable>
        );
    },
);

const getStyles = (colors: CustomTheme['colors'], index: number) =>
    StyleSheet.create({
        actionSlotContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: MARGIN_HORIZONTAL,
        },
        container: {
            backgroundColor: colors.card,
            borderRadius: spacing.m,
            marginTop: index === 0 ? 0 : 12,
            overflow: 'hidden',
        },
        creatorInfo: {
            marginTop: 0,
        },
        description: {
            color: colors.white,
            fontSize: 12,
            marginTop: 2,
            opacity: 0.7,
        },
        label: {
            color: colors.white,
            fontSize: 17,
        },
        metaRow: {
            alignItems: 'center',
            backgroundColor: colors.cardAccent600,
            borderRadius: spacing.m,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 6,
        },
        root: {
            alignItems: 'center',
            borderBottomLeftRadius: spacing.none,
            borderBottomRightRadius: spacing.none,
            borderColor: colors.cardAccent300,
            borderRadius: spacing.m,
            borderWidth: 1,
            flexDirection: 'row',
            overflow: 'hidden',
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 10,
        },
        textContainer: {
            flex: 1,
        },
    });
