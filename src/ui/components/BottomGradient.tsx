import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { CustomTheme } from '../Theme';

export const BottomGradient = () => {
    const { colors } = useTheme() as CustomTheme;

    return (
        <LinearGradient
            colors={['transparent', colors.background]}
            end={{ x: 0, y: 1 }}
            pointerEvents="none"
            start={{ x: 0, y: 0 }}
            style={styles.gradient}
        />
    );
};

const styles = StyleSheet.create({
    gradient: {
        bottom: 0,
        height: 120,
        left: 0,
        opacity: 0.7,
        position: 'absolute',
        right: 0,
        zIndex: 10,
    },
});
