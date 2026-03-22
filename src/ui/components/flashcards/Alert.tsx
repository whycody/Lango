import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { CustomText } from '..';

type AlertProps = {
    message: string;
    style?: StyleProp<ViewStyle>;
    title: string;
    type: 'error' | 'success';
};

export const Alert = ({ message, style, title, type }: AlertProps) => {
    const { colors } = useTheme();
    const styles = getStyles(colors, type);

    return (
        <View style={[styles.root, style]}>
            <View style={styles.headerContainer}>
                <Ionicons
                    color={colors.background}
                    name={type == 'success' ? 'checkmark-circle' : 'close-circle'}
                    size={21}
                />
                <CustomText style={styles.header} weight={'Bold'}>
                    {title}
                </CustomText>
            </View>
            <CustomText style={styles.message} weight={'SemiBold'}>
                {message}
            </CustomText>
        </View>
    );
};

const getStyles = (colors: any, type: 'error' | 'success') =>
    StyleSheet.create({
        header: {
            color: colors.background,
            fontSize: 15,
            marginLeft: 5,
        },
        headerContainer: {
            alignItems: 'center',
            flexDirection: 'row',
        },
        message: {
            color: colors.card,
            fontSize: 13,
            marginLeft: 2,
            marginTop: 3,
        },
        root: {
            backgroundColor: type == 'success' ? colors.green600 : colors.red600,
            marginVertical: 5,
            paddingHorizontal: MARGIN_HORIZONTAL / 2,
            paddingVertical: 12,
        },
    });
