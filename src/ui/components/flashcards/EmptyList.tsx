import * as React from 'react';
import { FC } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { TranslationKey } from '../../../types';
import { CustomTheme } from '../../Theme';

type EmptyListProps = {
    description?: string;
    descriptionTx?: TranslationKey;
    icon?: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    title?: string;
    titleTx?: TranslationKey;
};

export const EmptyList: FC<EmptyListProps> = ({
    description,
    descriptionTx,
    icon,
    onPress,
    style,
    title,
    titleTx,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const styles = getStyles(colors);

    const resolvedTitle = titleTx ? t(titleTx) : title;
    const resolvedDescription = descriptionTx ? t(descriptionTx) : description;

    return (
        <Pressable style={[styles.emptyViewContainer, style]} onPress={onPress}>
            <Ionicons
                color={colors.cardAccent300}
                name={icon || 'file-tray'}
                size={35}
                style={styles.icon}
            />
            <Text style={styles.header}>{resolvedTitle}</Text>
            <Text style={styles.text}>{resolvedDescription}</Text>
        </Pressable>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        emptyViewContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 50,
        },
        header: {
            color: colors.white,
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        icon: {
            marginBottom: 10,
        },
        text: {
            color: colors.white300,
            fontSize: 14,
            marginHorizontal: MARGIN_HORIZONTAL * 3,
            opacity: 0.8,
            textAlign: 'center',
        },
    });
