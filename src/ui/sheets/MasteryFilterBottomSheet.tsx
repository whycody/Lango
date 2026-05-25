import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';

import { MasteryFilterItem } from '../components/flashcards';
import { GenericBottomSheet } from './GenericBottomSheet';

export type MasteryFilter = 'all' | 'learning' | 'review' | 'mastered';

type MasteryFilterBottomSheetProps = {
    sheetName: string;
    value: MasteryFilter;
    onChange: (value: MasteryFilter) => void;
};

const FILTER_ICONS: Record<MasteryFilter, string> = {
    all: 'filter-remove-outline',
    learning: 'book-open-outline',
    review: 'refresh',
    mastered: 'check-circle-outline',
};

export const MasteryFilterBottomSheet = ({
    onChange,
    sheetName,
    value,
}: MasteryFilterBottomSheetProps) => {
    const { t } = useTranslation();

    const filters = useMemo<MasteryFilter[]>(() => ['all', 'learning', 'review', 'mastered'], []);

    const handlePress = useCallback(
        (id: string) => {
            onChange(id as MasteryFilter);
            TrueSheet.dismiss(sheetName);
        },
        [sheetName, onChange],
    );

    const renderItem = useCallback(
        ({ item }: { item: MasteryFilter }) => (
            <MasteryFilterItem
                checked={value === item}
                icon={FILTER_ICONS[item]}
                id={item}
                label={t(`mastery_filter.${item}`)}
                onPress={handlePress}
            />
        ),
        [value, handlePress, t],
    );

    return (
        <GenericBottomSheet
            description={t('mastery_filter.desc')}
            primaryActionLabel={t('cancel')}
            sheetName={sheetName}
            style={styles.sheet}
            title={t('mastery_filter.title')}
            onPrimaryButtonPress={() => TrueSheet.dismiss(sheetName)}
        >
            <FlatList data={filters} extraData={value} renderItem={renderItem} />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    sheet: {
        marginTop: 10,
    },
});
