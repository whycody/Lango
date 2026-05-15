import { FC } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { SessionLength } from '../../../constants/UserPreferences';
import { CustomTheme } from '../../../ui/Theme';
import { CustomText } from '..';

interface SessionLengthItemProps {
    length: SessionLength;
    shorter?: boolean;
    onPress?: () => void;
    selected: boolean;
    style?: StyleProp<ViewStyle>;
}

export const SessionLengthItem: FC<SessionLengthItemProps> = ({
    length,
    onPress,
    selected,
    shorter,
    style,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors, selected);
    const { t } = useTranslation();

    return (
        <Pressable style={styles.pressable} onPress={onPress}>
            <View style={[styles.root, style]}>
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
                    {(length * (shorter ? 5 : 10) + ` ${t('repetitions')}`).toUpperCase()}
                </CustomText>
            </View>
        </Pressable>
    );
};

const getStyles = (colors: CustomTheme['colors'], selected: boolean) =>
    StyleSheet.create({
        pressable: {
            flex: 1,
        },
        root: {
            backgroundColor: selected ? colors.cardAccent300 : colors.cardAccent,
            borderRadius: spacing.m,
            justifyContent: 'flex-end',
            opacity: selected ? 1 : 0.4,
            paddingBottom: MARGIN_VERTICAL / 2,
            paddingTop: MARGIN_VERTICAL * 1.2,
        },
        square: {
            backgroundColor: selected ? colors.orange : colors.white,
            borderRadius: spacing.xs,
            height: 20,
            marginHorizontal: 2,
            marginTop: 4,
            width: 20,
        },
        squaresContainer: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
        },
        subtitle: {
            color: colors.white,
            fontSize: 10,
            textAlign: 'center',
        },
        title: {
            color: colors.white,
            fontSize: 11,
            marginTop: 5,
            textAlign: 'center',
        },
    });
