import React, { FC } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

interface StatisticItemProps {
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    style?: StyleProp<ViewStyle>;
}

export const StatisticItem: FC<StatisticItemProps> = ({ description, icon, label, style }) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);

    return (
        <LinearGradient
            colors={[colors.card, colors.card]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={[styles.root, style]}
        >
            <View style={styles.header}>
                <Ionicons color={colors.white} name={icon} size={11} />
                <CustomText style={styles.description} weight={'SemiBold'}>
                    {description}
                </CustomText>
            </View>
            <CustomText style={styles.title} weight={'Black'}>
                {label}
            </CustomText>
        </LinearGradient>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        description: {
            color: colors.white,
            fontSize: 12,
        },
        header: {
            alignItems: 'center',
            backgroundColor: colors.cardAccent300,
            flexDirection: 'row',
            gap: 5,
            paddingHorizontal: 10,
            paddingVertical: 3,
        },
        root: {
            backgroundColor: colors.cardAccent600,
            borderColor: colors.card,
            borderRadius: spacing.m,
            borderWidth: 1,
            paddingBottom: 5,
        },
        title: {
            color: colors.white,
            fontSize: 28,
            paddingVertical: MARGIN_VERTICAL,
            textAlign: 'center',
        },
    });
