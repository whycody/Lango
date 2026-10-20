import { FC, ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { ThemeColors } from '../../../../types';
import { CustomTheme } from '../../../../ui/Theme';
import {
    ACTION_SLOT_BUTTON_BORDER_RADIUS,
    ACTION_SLOT_BUTTON_ICON_SIZE,
    ACTION_SLOT_BUTTON_SIZE,
    ACTION_SLOT_DISABLED_OPACITY,
    ACTION_SLOT_SIZE,
} from '../constants';

interface BundleActionSlotProps {
    buttonDisabled?: boolean;
    buttonIcon: keyof typeof Ionicons.glyphMap;
    buttonIconColor: string;
    buttonIconSize?: number;
    onButtonPress: () => void;
    ring: ReactNode;
}

export const BundleActionSlot: FC<BundleActionSlotProps> = ({
    buttonDisabled = false,
    buttonIcon,
    buttonIconColor,
    buttonIconSize = ACTION_SLOT_BUTTON_ICON_SIZE,
    onButtonPress,
    ring,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors), [colors]);

    return (
        <View style={styles.actionSlot}>
            <View pointerEvents="none" style={styles.ring}>
                {ring}
            </View>
            <Pressable
                disabled={buttonDisabled}
                hitSlop={8}
                style={[styles.button, buttonDisabled && styles.buttonDisabled]}
                onPress={onButtonPress}
            >
                <Ionicons color={buttonIconColor} name={buttonIcon} size={buttonIconSize} />
            </Pressable>
        </View>
    );
};

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        actionSlot: {
            alignItems: 'center',
            height: ACTION_SLOT_SIZE,
            justifyContent: 'center',
            width: ACTION_SLOT_SIZE,
        },
        button: {
            alignItems: 'center',
            backgroundColor: colors.cardAccent600,
            borderRadius: ACTION_SLOT_BUTTON_BORDER_RADIUS,
            height: ACTION_SLOT_BUTTON_SIZE,
            justifyContent: 'center',
            width: ACTION_SLOT_BUTTON_SIZE,
        },
        buttonDisabled: {
            opacity: ACTION_SLOT_DISABLED_OPACITY,
        },
        ring: {
            alignItems: 'center',
            height: ACTION_SLOT_SIZE,
            justifyContent: 'center',
            position: 'absolute',
            width: ACTION_SLOT_SIZE,
        },
    });
