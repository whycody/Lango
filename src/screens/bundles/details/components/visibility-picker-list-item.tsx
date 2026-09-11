import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../../constants/margins';
import { ThemeColors, WordsBundleVisibility } from '../../../../types';
import { CustomText } from '../../../../ui/components';
import { CustomTheme } from '../../../../ui/Theme';
import { BundleVisibilityOption } from '../types';

interface VisibilityPickerListItemProps {
    item: BundleVisibilityOption;
    isSelected: boolean;
    onSelect: (visibility: WordsBundleVisibility) => void;
}

export const VisibilityPickerListItem = ({
    isSelected,
    item,
    onSelect,
}: VisibilityPickerListItemProps) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors), [colors]);

    const handleSelect = () => {
        onSelect(item.visibility);
    };

    const ripple = {
        color: colors.background,
        foreground: true,
    };

    return (
        <Pressable android_ripple={ripple} onPress={handleSelect}>
            <View style={[styles.item, isSelected && styles.itemSelected]}>
                <Ionicons color={item.color} name={item.icon} size={20} />
                <View style={styles.labelContainer}>
                    <CustomText style={styles.label} tx={item.labelKey} weight="SemiBold" />
                    <CustomText style={styles.desc} tx={item.descKey} />
                </View>
            </View>
        </Pressable>
    );
};

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        desc: {
            color: colors.white600,
            fontSize: 12,
            marginTop: spacing.xxs,
        },
        item: {
            alignItems: 'center',
            backgroundColor: colors.cardAccent,
            borderColor: colors.cardAccent300,
            borderRadius: spacing.m,
            borderWidth: 1,
            flexDirection: 'row',
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: spacing.l,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: spacing.l,
        },
        itemSelected: {
            borderColor: colors.primary,
        },
        label: {
            color: colors.white,
            fontSize: 14,
        },
        labelContainer: {
            marginLeft: spacing.l,
        },
    });
