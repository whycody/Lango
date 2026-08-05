import { memo } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { BundleSearchResult } from '../../../types';
import { isIOS } from '../../../utils/deviceUtils';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';
import { BundleCreatorInfo } from '../home';

interface SearchBundleItemProps {
    bundle: BundleSearchResult;
    index: number;
    onInfoPress?: (bundle: BundleSearchResult) => void;
    onPress?: (bundle: BundleSearchResult) => void;
    style?: ViewStyle;
}

export const SearchBundleItem = memo<SearchBundleItemProps>(
    ({ bundle, index, onInfoPress, onPress, style }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors, index);
        const { triggerHaptics } = useHaptics();

        const handlePress = () => {
            onPress?.(bundle);
            triggerHaptics('light');
        };

        const handleInfoPress = () => {
            onInfoPress?.(bundle);
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
                            {bundle.title}
                        </CustomText>
                        {bundle.description && (
                            <CustomText
                                numberOfLines={1}
                                style={styles.description}
                                weight="Regular"
                            >
                                {bundle.description}
                            </CustomText>
                        )}
                    </View>
                    <View style={styles.infoButtonContainer}>
                        <Pressable hitSlop={8} style={styles.infoButton} onPress={handleInfoPress}>
                            <Ionicons color={colors.primary300} name="arrow-forward" size={18} />
                        </Pressable>
                    </View>
                </View>
                <View style={styles.metaRow}>
                    <BundleCreatorInfo
                        compact
                        creatorId={bundle.ownerId}
                        flashcardsCount={bundle.flashcardsCount}
                        style={styles.creatorInfo}
                    />
                </View>
            </Pressable>
        );
    },
);

const getStyles = (colors: CustomTheme['colors'], index: number) =>
    StyleSheet.create({
        container: {
            marginTop: index === 0 ? 0 : 16,
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
        infoButton: {
            alignItems: 'center',
            backgroundColor: colors.cardAccent600,
            borderRadius: 100,
            height: 36,
            justifyContent: 'center',
            width: 36,
        },
        infoButtonContainer: {
            alignItems: 'center',
            height: 44,
            justifyContent: 'center',
            marginLeft: 20,
            width: 44,
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
            paddingVertical: 4,
        },
        root: {
            alignItems: 'center',
            backgroundColor: colors.card,
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
