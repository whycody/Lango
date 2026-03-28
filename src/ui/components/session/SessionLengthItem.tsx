import { FC } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { MARGIN_VERTICAL } from '../../../constants/margins';
import { SessionLength } from '../../../constants/UserPreferences';
import { CustomText } from '..';

interface SessionLengthItemProps {
    length: SessionLength;
    onPress?: () => void;
    selected: boolean;
    style?: StyleProp<ViewStyle>;
}

export const SessionLengthItem: FC<SessionLengthItemProps> = ({
    length,
    onPress,
    selected,
    style,
}) => {
    const { colors } = useTheme();
    const styles = getStyles(colors, selected);
    const { t } = useTranslation();

    return (
        <Pressable style={styles.pressable} onPress={onPress}>
            <LinearGradient
                colors={[colors.cardAccent600, colors.background]}
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}
                style={[styles.root, style]}
            >
                <View style={styles.squaresContainer}>
                    {length > 2 && <View style={styles.square} />}
                </View>
                <View style={styles.squaresContainer}>
                    {length > 1 && <View style={styles.square} />}
                    <View style={styles.square} />
                </View>
                <CustomText style={styles.title} weight={'Bold'}>
                    {t(
                        length === SessionLength.SHORT
                            ? 'shortSession'
                            : length === SessionLength.MEDIUM
                              ? 'mediumSession'
                              : 'longSession',
                    )}
                </CustomText>
                <CustomText style={styles.subtitle}>
                    {(length * 10 + ` ${t('repetitions')}`).toUpperCase()}
                </CustomText>
            </LinearGradient>
        </Pressable>
    );
};

const getStyles = (colors: any, selected: boolean) =>
    StyleSheet.create({
        pressable: {
            flex: 1,
        },
        root: {
            flex: 1,
            opacity: selected ? 1 : 0.4,
            paddingBottom: MARGIN_VERTICAL / 2,
            paddingTop: MARGIN_VERTICAL * 1.2,
        },
        square: {
            backgroundColor: colors.primary300,
            height: 20,
            marginHorizontal: 2,
            marginTop: 4,
            width: 20,
        },
        squaresContainer: {
            alignItems: 'center',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
        },
        subtitle: {
            color: colors.primary300,
            fontSize: 10,
            textAlign: 'center',
        },
        title: {
            color: colors.primary300,
            fontSize: 11,
            marginTop: 5,
            textAlign: 'center',
        },
    });
