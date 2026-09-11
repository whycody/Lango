import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { CustomTheme } from '../../../../ui/Theme';
import { ACTION_SLOT_SIZE } from '../constants';

interface BundleActionSlotProps {
    buttonDisabled?: boolean;
    buttonIcon: keyof typeof Ionicons.glyphMap;
    buttonIconColor: string;
    buttonIconSize?: number;
    onButtonPress: () => void;
    ring: ReactNode;
}

export const BundleActionSlot = ({
    buttonDisabled = false,
    buttonIcon,
    buttonIconColor,
    buttonIconSize = 14,
    onButtonPress,
    ring,
}: BundleActionSlotProps) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);

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

const getStyles = (colors: CustomTheme['colors']) =>
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
            borderRadius: 100,
            height: 28,
            justifyContent: 'center',
            width: 28,
        },
        buttonDisabled: {
            opacity: 0.4,
        },
        ring: {
            alignItems: 'center',
            height: ACTION_SLOT_SIZE,
            justifyContent: 'center',
            position: 'absolute',
            width: ACTION_SLOT_SIZE,
        },
    });
