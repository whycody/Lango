import { FC } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { CustomTheme } from '../Theme';
import { CustomText } from './CustomText';

interface HeaderProps {
    style?: StyleProp<ViewStyle>;
    subtitle?: string;
    title: string;
    centered?: boolean;
}

export const Header: FC<HeaderProps> = ({ centered = false, style, subtitle, title }) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);

    return (
        <View style={style}>
            <CustomText style={[styles.title, centered && styles.center]} weight={'Bold'}>
                {title}
            </CustomText>
            {subtitle && (
                <CustomText style={[styles.subtitle, centered && styles.center]}>
                    {subtitle}
                </CustomText>
            )}
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        center: {
            textAlign: 'center',
        },
        subtitle: {
            color: colors.primary600,
            fontSize: 14,
            marginTop: 6,
        },
        title: {
            color: colors.primary300,
            fontSize: 18,
        },
    });
