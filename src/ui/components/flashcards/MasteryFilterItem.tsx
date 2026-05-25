import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

type MasteryFilterItemProps = {
    checked: boolean;
    icon: string;
    id: string;
    label: string;
    onPress: (id: string) => void;
};

export const MasteryFilterItem = memo<MasteryFilterItemProps>(
    ({ checked, icon, id, label, onPress }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);

        return (
            <Pressable
                android_ripple={{ color: colors.background, foreground: true }}
                onPress={() => onPress(id)}
            >
                <View style={[styles.container, checked && { borderColor: colors.primary }]}>
                    <MaterialCommunityIcons color={colors.orange} name={icon as any} size={22} />
                    <View style={styles.textContainer}>
                        <CustomText style={styles.text} weight={'SemiBold'}>
                            {label}
                        </CustomText>
                    </View>
                    {checked && (
                        <MaterialCommunityIcons color={colors.primary} name={'check'} size={20} />
                    )}
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
        text: {
            color: colors.white,
            fontSize: 14,
        },
        textContainer: {
            flex: 1,
            marginLeft: 10,
        },
    });
