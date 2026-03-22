import { FC } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { CustomText } from '.';

interface HeaderProps {
    style?: StyleProp<ViewStyle>;
    subtitle?: string;
    title: string;
}

export const Header: FC<HeaderProps> = ({ style, subtitle, title }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
        <View style={style}>
            <CustomText style={styles.title} weight={'Bold'}>
                {title}
            </CustomText>
            {subtitle && <CustomText style={styles.subtitle}>{subtitle}</CustomText>}
        </View>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
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
