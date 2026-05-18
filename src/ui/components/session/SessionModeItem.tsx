import { FC } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { spacing } from '../../../constants/margins';
import { SessionMode } from '../../../constants/Session';
import { FlashcardSide } from '../../../constants/UserPreferences';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

interface SessionModeItemProps {
    mode: SessionMode | FlashcardSide;
    onPress?: () => void;
    selected: boolean;
    style?: StyleProp<ViewStyle>;
    color?: string;
}

export const SessionModeItem: FC<SessionModeItemProps> = ({
    color,
    mode,
    onPress,
    selected,
    style,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors, selected);
    const { t } = useTranslation();

    let iconName: keyof typeof Ionicons.glyphMap = 'school';
    switch (mode) {
        case SessionMode.STUDY:
            iconName = 'school';
            break;
        case SessionMode.RANDOM:
            iconName = 'dice';
            break;
        case SessionMode.OLDEST:
            iconName = 'time';
            break;
        case FlashcardSide.WORD:
            iconName = 'chatbubbles';
            break;
        case FlashcardSide.TRANSLATION:
            iconName = 'language';
            break;
    }

    return (
        <Pressable style={styles.pressable} onPress={onPress}>
            <View style={[styles.root, style]}>
                <Ionicons
                    color={selected && color ? color : colors.white}
                    name={iconName}
                    size={18}
                    style={styles.icon}
                />
                <CustomText style={styles.title} weight={'Bold'}>
                    {t(mode.toLowerCase())}
                </CustomText>
            </View>
        </Pressable>
    );
};

const getStyles = (colors: CustomTheme['colors'], selected: boolean) =>
    StyleSheet.create({
        icon: {
            paddingRight: 5,
        },
        pressable: {
            backgroundColor: selected ? colors.cardAccent300 : colors.cardAccent,
            borderRadius: spacing.m,
            flex: 1,
        },
        root: {
            alignItems: 'center',
            flexDirection: 'column',
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
            color: colors.white,
            fontSize: 12,
            textAlign: 'center',
        },
    });
