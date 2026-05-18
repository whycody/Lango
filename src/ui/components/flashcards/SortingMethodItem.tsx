import { memo } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

type SortingMethodItemProps = {
    checked: boolean;
    id: number;
    label: string;
    onPress: (id: number) => void;
    style?: StyleProp<ViewStyle>;
};

export const SortingMethodItem = memo<SortingMethodItemProps>(
    ({ checked, id, label, onPress, style }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);

        return (
            <Pressable
                key={label}
                android_ripple={{ color: colors.background, foreground: true }}
                style={style}
                onPress={() => onPress(id)}
            >
                <View style={[styles.container, checked && { borderColor: colors.primary }]}>
                    <MaterialCommunityIcons color={colors.orange} name={'sort'} size={22} />
                    <View style={styles.textContainer}>
                        <CustomText style={styles.text} weight={'SemiBold'}>
                            {label}
                        </CustomText>
                    </View>
                </View>
            </Pressable>
        );
    },
);

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            backgroundColor: colors.cardAccent,
            borderColor: colors.cardAccent300,
            borderRadius: spacing.m,
            borderWidth: 1,
            flexDirection: 'row',
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 12,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 15,
        },
        divider: {
            backgroundColor: colors.background,
            height: 3,
            width: '100%',
        },
        text: {
            color: colors.white,
            fontSize: 14,
        },
        textContainer: {
            flex: 1,
            marginLeft: 10,
        },
    });
