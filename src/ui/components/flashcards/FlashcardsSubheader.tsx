import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { FlashcardSortingMethod } from '../../../constants/UserPreferences';
import { getSortingMethodLabel } from '../../../utils/sortingUtil';
import { MasteryFilter } from '../../sheets/MasteryFilterBottomSheet';
import { CustomTheme } from '../../Theme';
import { CustomText } from '../CustomText';
import { ListFilter } from './ListFilter';

type FlashcardsSubheaderProps = {
    filterSheetName: string;
    masteryFilter: MasteryFilter;
    showFilter?: boolean;
    showSearch?: boolean;
    sortingMethod: FlashcardSortingMethod;
    sortingSheetName: string;
    onClearSearch?: () => void;
    onSearchPress?: () => void;
};

export const FlashcardsSubheader = memo<FlashcardsSubheaderProps>(
    ({
        filterSheetName,
        masteryFilter,
        onClearSearch,
        onSearchPress,
        showFilter = true,
        showSearch = true,
        sortingMethod,
        sortingSheetName,
    }) => {
        const { colors } = useTheme() as CustomTheme;
        const { t } = useTranslation();
        const styles = getStyles(colors);

        return (
            <View style={[styles.container, !showSearch && styles.containerWithoutSearch]}>
                {showSearch && (
                    <Pressable onPress={onSearchPress}>
                        <ListFilter
                            editable={false}
                            isSearching={false}
                            pointerEvents="none"
                            styleRoot={styles.listFilter}
                            onClear={onClearSearch ?? (() => {})}
                        />
                    </Pressable>
                )}
                <View style={styles.row}>
                    <Pressable
                        style={styles.sortingButton}
                        onPress={() => TrueSheet.present(sortingSheetName)}
                    >
                        <MaterialCommunityIcons
                            color={colors.white}
                            name={'sort-variant'}
                            size={18}
                        />
                        <CustomText style={styles.sortingLabel} weight={'SemiBold'}>
                            {getSortingMethodLabel(sortingMethod)}
                        </CustomText>
                    </Pressable>
                    {showFilter && (
                        <Pressable
                            style={styles.filterButton}
                            onPress={() => TrueSheet.present(filterSheetName)}
                        >
                            {masteryFilter !== 'all' && (
                                <CustomText style={styles.filterLabel} weight={'SemiBold'}>
                                    {t(`mastery_filter.${masteryFilter}`)}
                                </CustomText>
                            )}
                            <MaterialCommunityIcons
                                color={masteryFilter !== 'all' ? colors.primary300 : colors.white}
                                name={'filter-variant'}
                                size={20}
                            />
                        </Pressable>
                    )}
                </View>
            </View>
        );
    },
);

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        container: {
            backgroundColor: colors.background,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        containerWithoutSearch: {
            paddingTop: MARGIN_VERTICAL / 2,
        },
        filterButton: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: 6,
            paddingBottom: 8,
            paddingLeft: 8,
        },
        filterLabel: {
            color: colors.white,
            fontSize: 13,
        },
        listFilter: {
            marginVertical: spacing.l,
        },
        row: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        sortingButton: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: 8,
            paddingBottom: 8,
        },
        sortingLabel: {
            color: colors.white,
            fontSize: 13,
        },
    });
