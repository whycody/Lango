import { FC } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { CustomTheme } from '../Theme';
import { CustomText } from './CustomText';
import { SquareFlag } from './SquareFlag';

type ScreenHeaderProps = {
    title: string;
    streakActive: boolean;
    streakIsGoal: boolean;
    streakNumberOfDays: number;
    mainLang: string;
    onFlagPress: () => void;
};

export const ScreenHeader: FC<ScreenHeaderProps> = ({
    mainLang,
    onFlagPress,
    streakActive,
    streakIsGoal,
    streakNumberOfDays,
    title,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <CustomText style={styles.mainText} weight={'Bold'}>
                {title}
            </CustomText>
            <MaterialCommunityIcons
                name={'fire'}
                size={32}
                color={
                    streakActive
                        ? streakIsGoal
                            ? colors.yellow
                            : colors.red
                        : colors.cardAccent300
                }
            />
            <CustomText
                weight={'Bold'}
                style={[
                    styles.streakText,
                    streakIsGoal && { color: colors.yellow },
                    !streakActive && styles.inactiveStreak,
                ]}
            >
                {streakNumberOfDays.toString()}
            </CustomText>
            <Pressable style={styles.flag} onPress={onFlagPress}>
                <SquareFlag languageCode={mainLang} size={24} />
            </Pressable>
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            flexDirection: 'row',
        },
        flag: {
            paddingLeft: 5,
            paddingVertical: 5,
        },
        inactiveStreak: {
            color: colors.cardAccent300,
        },
        mainText: {
            color: colors.white,
            flex: 1,
            fontSize: 26,
        },
        streakText: {
            color: colors.white,
            fontSize: 18,
            marginRight: 15,
        },
    });
