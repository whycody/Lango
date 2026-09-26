import { FC } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { TranslationKey } from '../../types';
import { CustomTheme } from '../Theme';
import { CustomText } from './CustomText';

interface HeaderProps {
    style?: StyleProp<ViewStyle>;
    subtitle?: string;
    subtitleTx?: TranslationKey;
    title?: string;
    titleTx?: TranslationKey;
    centered?: boolean;
}

export const Header: FC<HeaderProps> = ({
    centered = false,
    style,
    subtitle,
    subtitleTx,
    title,
    titleTx,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const styles = getStyles(colors);

    const resolvedTitle = titleTx ? t(titleTx) : title;
    const resolvedSubtitle = subtitleTx ? t(subtitleTx) : subtitle;

    return (
        <View style={style}>
            <CustomText style={[styles.title, centered && styles.center]} weight={'Bold'}>
                {resolvedTitle}
            </CustomText>
            {resolvedSubtitle && (
                <CustomText style={[styles.subtitle, centered && styles.center]}>
                    {resolvedSubtitle}
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
            color: colors.white,
            fontSize: 13,
            marginTop: 2,
            opacity: 0.7,
        },
        title: {
            color: colors.white,
            fontSize: 18,
        },
    });
