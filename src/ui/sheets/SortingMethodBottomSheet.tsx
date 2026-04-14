import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';

import { FlashcardSortingMethod } from '../../constants/UserPreferences';
import { useUserPreferences } from '../../store';
import { getSortingMethodLabel } from '../../utils/sortingUtil';
import { SortingMethodItem } from '../components/flashcards';
import { GenericBottomSheet } from './GenericBottomSheet';

type SortingMethodBottomSheetProps = {
    sheetName: string;
};

export const SortingMethodBottomSheet = (props: SortingMethodBottomSheetProps) => {
    const { t } = useTranslation();
    const { flashcardsSortingMethod, setFlashcardsSortingMethod } = useUserPreferences();

    const sortingMethods = useMemo(
        () =>
            Object.values(FlashcardSortingMethod).filter(
                v => typeof v === 'number',
            ) as FlashcardSortingMethod[],
        [],
    );

    const handlePress = useCallback(
        (method: FlashcardSortingMethod) => {
            setFlashcardsSortingMethod(method);
            TrueSheet.dismiss(props.sheetName);
        },
        [props.sheetName, setFlashcardsSortingMethod],
    );

    const renderItem = useCallback(
        ({ index, item }: { index: number; item: FlashcardSortingMethod }) => (
            <SortingMethodItem
                checked={flashcardsSortingMethod === item}
                id={item}
                index={index}
                label={getSortingMethodLabel(item)}
                onPress={handlePress}
            />
        ),
        [flashcardsSortingMethod, handlePress],
    );

    return (
        <GenericBottomSheet
            description={t('sorting.desc')}
            sheetName={props.sheetName}
            style={styles.sheet}
            title={t('sorting.title')}
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
