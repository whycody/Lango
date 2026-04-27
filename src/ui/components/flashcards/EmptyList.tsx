import * as React from 'react';
import { FC } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { CustomTheme } from '../../Theme';

type EmptyListProps = {
    description?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    title?: string;
};

export const EmptyList: FC<EmptyListProps> = ({ description, icon, onPress, style, title }) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);

    return (
        <Pressable style={[styles.emptyViewContainer, style]} onPress={onPress}>
            <Ionicons
                color={colors.primary300}
                name={icon || 'file-tray-sharp'}
                size={35}
                style={styles.icon}
            />
            <Text style={styles.header}>{title}</Text>
            <Text style={styles.text}>{description}</Text>
        </Pressable>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        emptyViewContainer: {
            alignItems: 'center',
            backgroundColor: colors.background,
            justifyContent: 'center',
            marginVertical: 50,
        },
        header: {
            color: colors.primary300,
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        icon: {
            marginBottom: 10,
            opacity: 0.8,
        },
        text: {
            color: colors.primary300,
            fontSize: 14,
            marginHorizontal: MARGIN_HORIZONTAL * 3,
            opacity: 0.8,
            textAlign: 'center',
        },
    });
