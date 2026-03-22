import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { MARGIN_VERTICAL } from '../../../constants/margins';
import { CustomText } from '..';

interface StatisticItemProps {
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    style?: any;
}

export const StatisticItem: FC<StatisticItemProps> = ({ description, icon, label, style }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
        <LinearGradient
            colors={[colors.cardAccent600, colors.background]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={[styles.root, style]}
        >
            <View style={styles.header}>
                <Ionicons color={colors.primary300} name={icon} size={10} />
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

const getStyles = (colors: any) =>
    StyleSheet.create({
        description: {
            color: colors.primary300,
            fontSize: 12,
        },
        header: {
            alignItems: 'center',
            backgroundColor: colors.cardAccent,
            flexDirection: 'row',
            gap: 5,
            paddingHorizontal: 10,
            paddingVertical: 4,
        },
        root: {
            backgroundColor: colors.cardAccent600,
            paddingBottom: 5,
        },
        title: {
            color: colors.primary300,
            fontSize: 28,
            paddingVertical: MARGIN_VERTICAL,
            textAlign: 'center',
        },
    });
