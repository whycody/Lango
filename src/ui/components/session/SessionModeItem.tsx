import { FC } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { FlashcardSide } from '../../../store';
import { SessionMode } from '../../../types';
import { CustomText } from '..';

interface SessionModeItemProps {
    mode: SessionMode | FlashcardSide;
    onPress?: () => void;
    selected: boolean;
    style?: any;
}

export const SessionModeItem: FC<SessionModeItemProps> = ({ mode, onPress, selected, style }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors, selected);
    const { t } = useTranslation();

    let iconName: keyof typeof Ionicons.glyphMap = 'school-outline';
    switch (mode) {
        case SessionMode.STUDY:
            iconName = 'school-outline';
            break;
        case SessionMode.RANDOM:
            iconName = 'dice-outline';
            break;
        case SessionMode.OLDEST:
            iconName = 'time-outline';
            break;
        case FlashcardSide.WORD:
            iconName = 'chatbubbles-outline';
            break;
        case FlashcardSide.TRANSLATION:
            iconName = 'language-outline';
            break;
    }

    return (
        <Pressable style={styles.pressable} onPress={onPress}>
            <LinearGradient
                colors={[colors.cardAccent600, colors.background]}
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}
                style={[styles.root, style]}
            >
                <Ionicons color={colors.primary300} name={iconName} size={18} style={styles.icon} />
                <CustomText style={styles.title} weight={'Bold'}>
                    {t(mode.toLowerCase())}
                </CustomText>
            </LinearGradient>
        </Pressable>
    );
};

const getStyles = (colors: any, selected: boolean) =>
    StyleSheet.create({
        icon: {
            paddingRight: 5,
        },
        pressable: {
            flex: 1,
        },
        root: {
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            opacity: selected ? 1 : 0.4,
            paddingHorizontal: 15,
            paddingVertical: 10,
        },
        squaresContainer: {
            alignItems: 'center',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
        },
        title: {
            color: colors.primary300,
            fontSize: 12,
            textAlign: 'center',
        },
    });
