import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL } from '../../constants/margins';
import { FlashcardSortingMethod } from '../../constants/UserPreferences';
import { useUserPreferences } from '../../store';
import { getSortingMethodLabel } from '../../utils/sortingUtil';
import { Header } from '../components';
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
            title={t('sorting.title')}
        >
            <FlashList
                data={sortingMethods}
                extraData={flashcardsSortingMethod}
                renderItem={renderItem}
            />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    header: {
        marginVertical: 10,
        paddingHorizontal: MARGIN_HORIZONTAL,
    },
});
