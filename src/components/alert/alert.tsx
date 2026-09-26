import React, { FC, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../constants/margins';
import { fontSize } from '../../constants/typography';
import { ThemeColors, TranslationKey } from '../../types';
import { CustomText } from '../../ui/components';
import { CustomTheme } from '../../ui/Theme';

type AlertType = 'error' | 'success';

interface AlertProps {
    message?: string;
    messageTx?: TranslationKey;
    style?: StyleProp<ViewStyle>;
    title?: string;
    titleTx?: TranslationKey;
    type: AlertType;
}

export const Alert: FC<AlertProps> = ({ message, messageTx, style, title, titleTx, type }) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors, type), [colors, type]);

    return (
        <View style={[styles.root, style]}>
            <View style={styles.headerContainer}>
                <Ionicons
                    color={colors.background}
                    name={type == 'success' ? 'checkmark-circle' : 'close-circle'}
                    size={21}
                />
                <CustomText style={styles.header} text={title} tx={titleTx} weight="Bold" />
            </View>
            <CustomText style={styles.message} text={message} tx={messageTx} weight="SemiBold" />
        </View>
    );
};

const getStyles = (colors: ThemeColors, type: AlertType) =>
    StyleSheet.create({
        header: {
            color: colors.background,
            fontSize: fontSize.xl,
            marginLeft: spacing.s,
        },
        headerContainer: {
            alignItems: 'center',
            flexDirection: 'row',
        },
        message: {
            color: colors.card,
            fontSize: fontSize.m,
            marginLeft: spacing.xxs,
            marginTop: spacing.xxs,
        },
        root: {
            backgroundColor: type == 'success' ? colors.green600 : colors.red600,
            borderRadius: spacing.m,
            marginVertical: spacing.s,
            paddingHorizontal: MARGIN_HORIZONTAL / 2,
            paddingVertical: spacing.l,
        },
    });
