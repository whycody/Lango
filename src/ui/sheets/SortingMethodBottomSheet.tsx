import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';

import { SORTING_COLORS } from '../../constants/SortingColors';
import { FlashcardSortingMethod } from '../../constants/UserPreferences';
import { useUserPreferences } from '../../store';
import { getSortingMethodLabel } from '../../utils/sortingUtil';
import { SortingMethodItem } from '../components/flashcards';
import { GenericBottomSheet } from './GenericBottomSheet';

type SortingMethodBottomSheetProps = {
    availableMethods?: FlashcardSortingMethod[];
    sheetName: string;
};

export const SortingMethodBottomSheet = ({
    availableMethods,
    sheetName,
}: SortingMethodBottomSheetProps) => {
    const { t } = useTranslation();
    const { flashcardsSortingMethod, setFlashcardsSortingMethod } = useUserPreferences();

    const sortingMethods = useMemo(
        () =>
            availableMethods ??
            (Object.values(FlashcardSortingMethod).filter(
                v => typeof v === 'number',
            ) as FlashcardSortingMethod[]),
        [availableMethods],
    );

    const handlePress = useCallback(
        (method: FlashcardSortingMethod) => {
            setFlashcardsSortingMethod(method);
            TrueSheet.dismiss(sheetName);
        },
        [sheetName, setFlashcardsSortingMethod],
    );

    const renderItem = useCallback(
        ({ item }: { item: FlashcardSortingMethod }) => (
            <SortingMethodItem
                checked={flashcardsSortingMethod === item}
                color={SORTING_COLORS[item]}
                id={item}
                label={getSortingMethodLabel(item)}
                onPress={handlePress}
            />
        ),
        [flashcardsSortingMethod, handlePress],
    );

    return (
        <GenericBottomSheet
            description={t('sorting.desc')}
            primaryActionLabel={t('cancel')}
            sheetName={sheetName}
            style={styles.sheet}
            title={t('sorting.title')}
            onPrimaryButtonPress={() => TrueSheet.dismiss(sheetName)}
        >
            <FlatList
                data={sortingMethods}
                extraData={flashcardsSortingMethod}
                renderItem={renderItem}
            />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    sheet: {
        marginTop: 10,
    },
});
