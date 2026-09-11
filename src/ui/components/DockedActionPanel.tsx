import { ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { EdgeInsets } from 'react-native-safe-area-context';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { CustomTheme } from '../Theme';

const HIDDEN_TRANSLATE_Y = 100;

interface DockedActionPanelProps {
    children: ReactNode;
    insets: EdgeInsets;
    visible: boolean;
}

export const DockedActionPanel = ({ children, insets, visible }: DockedActionPanelProps) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors, insets);

    const translateY = useRef(new Animated.Value(HIDDEN_TRANSLATE_Y)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(translateY, {
                damping: 18,
                mass: 0.7,
                stiffness: 220,
                toValue: visible ? 0 : HIDDEN_TRANSLATE_Y,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                duration: 220,
                toValue: visible ? 1 : 0,
                useNativeDriver: true,
            }),
        ]).start();
    }, [visible, translateY, opacity]);

    return (
        <Animated.View
            pointerEvents={visible ? 'box-none' : 'none'}
            style={[styles.panel, { opacity, transform: [{ translateY }] }]}
        >
            {children}
        </Animated.View>
    );
};

const getStyles = (colors: CustomTheme['colors'], insets: EdgeInsets) =>
    StyleSheet.create({
        panel: {
            backgroundColor: colors.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            bottom: 0,
            left: 0,
            paddingBottom: insets.bottom + MARGIN_VERTICAL / 2,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: MARGIN_VERTICAL / 2,
            position: 'absolute',
            right: 0,
            zIndex: 30,
        },
    });
