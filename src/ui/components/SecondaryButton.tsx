import React, { FC } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { spacing } from '../../constants/margins';
import { CustomTheme } from '../Theme';
import { CustomText } from './CustomText';

interface SecondaryButtonProps {
    color?: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress?: () => void;
}

export const SecondaryButton: FC<SecondaryButtonProps> = ({ color, icon, label, onPress }) => {
    const { colors } = useTheme() as CustomTheme;
    const resolvedColor = color ?? colors.white;
    const styles = getStyles(colors);

    return (
        <Pressable style={styles.root} onPress={onPress}>
            <Ionicons color={resolvedColor} name={icon} size={18} />
            <CustomText style={[styles.label, { color: resolvedColor }]} weight="SemiBold">
                {label}
            </CustomText>
        </Pressable>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        label: {
            fontSize: 13,
        },
        root: {
            alignItems: 'center',
            borderColor: colors.cardAccent300,
            borderRadius: spacing.m,
            borderWidth: 1,
            flex: 1,
            flexDirection: 'row',
            gap: spacing.xs,
            justifyContent: 'center',
            paddingVertical: 11,
        },
    });
