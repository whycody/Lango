import { memo } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { FlashcardSortingMethod } from '../../../constants/UserPreferences';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

const SORTING_ICONS: Record<FlashcardSortingMethod, string> = {
    [FlashcardSortingMethod.ADD_DATE_DESC]: 'sort-descending',
    [FlashcardSortingMethod.ADD_DATE_ASC]: 'sort-ascending',
    [FlashcardSortingMethod.GRADE_THREE_PROB_DESC]: 'star',
    [FlashcardSortingMethod.GRADE_THREE_PROB_ASC]: 'star-outline',
    [FlashcardSortingMethod.REPETITIONS_COUNT_DESC]: 'repeat',
    [FlashcardSortingMethod.REPETITIONS_COUNT_ASC]: 'repeat-off',
};

type SortingMethodItemProps = {
    checked: boolean;
    color: string;
    id: FlashcardSortingMethod;
    label: string;
    onPress: (id: FlashcardSortingMethod) => void;
    style?: StyleProp<ViewStyle>;
};

export const SortingMethodItem = memo<SortingMethodItemProps>(
    ({ checked, color, id, label, onPress, style }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);

        return (
            <Pressable
                android_ripple={{ color: colors.background, foreground: true }}
                style={style}
                onPress={() => onPress(id)}
            >
                <View style={[styles.container, checked && { borderColor: colors.primary }]}>
                    <MaterialCommunityIcons
                        color={color}
                        name={SORTING_ICONS[id] as any}
                        size={22}
                    />
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
