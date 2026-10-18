import { FC, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { spacing } from '../../../../constants/margins';
import { fontSize } from '../../../../constants/typography';
import { ThemeColors } from '../../../../types';
import { CustomText } from '../../../../ui/components';
import { CustomTheme } from '../../../../ui/Theme';
import { PREMIUM_BADGE_ICON_SIZE, PREMIUM_BADGE_LARGE_ICON_SIZE } from '../constants';

type PremiumBadgeSize = 'large' | 'small';

interface PremiumBadgeProps {
    size?: PremiumBadgeSize;
    style?: StyleProp<ViewStyle>;
}

export const PremiumBadge: FC<PremiumBadgeProps> = ({ size = 'small', style }) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors), [colors]);
    const isLarge = size === 'large';

    return (
        <View style={[styles.root, isLarge && styles.rootLarge, style]}>
            <Ionicons
                color={colors.yellow600}
                name="diamond"
                size={isLarge ? PREMIUM_BADGE_LARGE_ICON_SIZE : PREMIUM_BADGE_ICON_SIZE}
            />
            <CustomText
                style={[styles.label, isLarge && styles.labelLarge]}
                tx="bundles.premium_badge"
                weight="Bold"
            />
        </View>
    );
};

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        label: {
            color: colors.yellow600,
            fontSize: fontSize.xs,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
        },
        labelLarge: {
            fontSize: fontSize.m,
        },
        root: {
            alignItems: 'center',
            alignSelf: 'flex-start',
            backgroundColor: colors.yellow300,
            borderRadius: spacing.xl,
            flexDirection: 'row',
            gap: spacing.xs,
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.xxs,
        },
        rootLarge: {
            gap: spacing.s,
            paddingHorizontal: spacing.l,
            paddingVertical: spacing.xs,
        },
    });
