import { FC } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { CustomTheme } from '../Theme';

type TopGradientProps = {
    style?: StyleProp<ViewStyle>;
};

export const TopGradient: FC<TopGradientProps> = ({ style }) => {
    const { colors } = useTheme() as CustomTheme;

    return (
        <LinearGradient
            end={{ x: 0, y: 1 }}
            locations={[0, 0.55, 0.65, 0.74, 0.82, 0.89, 0.94, 0.98, 1]}
            pointerEvents="none"
            start={{ x: 0, y: 0 }}
            style={[styles.gradient, style]}
            colors={[
                colors.background,
                colors.background,
                `${colors.background}f2`,
                `${colors.background}d9`,
                `${colors.background}b3`,
                `${colors.background}80`,
                `${colors.background}4d`,
                `${colors.background}1a`,
                'transparent',
            ]}
        />
    );
};

const styles = StyleSheet.create({
    gradient: {
        height: 200,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
    },
});
