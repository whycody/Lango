import { Animated, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_VERTICAL } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { CustomTheme } from '../../Theme';

type ScrollToTopButtonProps = {
    animatedValue: Animated.Value;
    addButtonAnim: Animated.Value;
    liftOffset?: number;
    onPress: () => void;
};

export const ScrollToTopButton = ({
    addButtonAnim,
    animatedValue,
    liftOffset = 56,
    onPress,
}: ScrollToTopButtonProps) => {
    const { colors } = useTheme() as CustomTheme;
    const { triggerHaptics } = useHaptics();

    const handlePress = () => {
        triggerHaptics('light');
        onPress();
    };

    const translateY = Animated.add(
        animatedValue.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }),
        addButtonAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -liftOffset] }),
    );

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    bottom: MARGIN_VERTICAL * 2,
                    opacity: animatedValue,
                    transform: [{ translateY }],
                },
            ]}
        >
            <Pressable
                style={[styles.button, { backgroundColor: colors.white600 }]}
                onPress={handlePress}
            >
                <Ionicons color={colors.white} name="arrow-up" size={20} />
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        borderRadius: 24,
        borderWidth: 1,
        elevation: 4,
        height: 40,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        width: 40,
    },
    container: {
        alignSelf: 'center',
        bottom: 0,
        position: 'absolute',
        zIndex: 15,
    },
});
