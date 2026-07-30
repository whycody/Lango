import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { spacing } from '../../constants/margins';
import { CustomTheme } from '../Theme';
import { CustomText } from './CustomText';

type StatRowProps = {
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
};

export const StatRow: FC<StatRowProps> = ({ color, icon, label, value }) => {
    const { colors } = useTheme() as CustomTheme;
    return (
        <View style={styles.root}>
            <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
                <Ionicons color={color} name={icon} size={17} />
            </View>
            <CustomText style={[styles.label, { color: colors.white }]}>{label}</CustomText>
            <CustomText style={[styles.value, { color: colors.white }]} weight="Bold">
                {value}
            </CustomText>
        </View>
    );
};

const styles = StyleSheet.create({
    iconWrap: {
        alignItems: 'center',
        borderRadius: spacing.s,
        height: 34,
        justifyContent: 'center',
        width: 34,
    },
    label: {
        flex: 1,
        fontSize: 14,
    },
    root: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.m,
        paddingVertical: spacing.s,
    },
    value: {
        fontSize: 16,
    },
});
