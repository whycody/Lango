import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';

import { BOTTOM_SHEET_GRABBER_OPTIONS } from '../../constants/Common';
import { MARGIN_HORIZONTAL } from '../../constants/margins';
import { FlashcardSortingMethod } from '../../constants/UserPreferences';
import { useUserPreferences } from '../../store';
import { getSortingMethodLabel } from '../../utils/sortingUtil';
import { Header } from '../components';
import { SortingMethodItem } from '../components/flashcards';
import { CustomTheme } from '../Theme';

type SortingMethodBottomSheetProps = {
    sheetName: string;
};

export const SortingMethodBottomSheet = (props: SortingMethodBottomSheetProps) => {
    const { colors } = useTheme() as CustomTheme;
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
        <TrueSheet
            backgroundColor={colors.card}
            detents={['auto']}
            grabberOptions={BOTTOM_SHEET_GRABBER_OPTIONS}
            name={props.sheetName}
        >
            <View>
                <Header
                    style={styles.header}
                    subtitle={t('sorting.desc')}
                    title={t('sorting.title')}
                />
                <FlashList
                    data={sortingMethods}
                    extraData={flashcardsSortingMethod}
                    renderItem={renderItem}
                />
            </View>
        </TrueSheet>
    );
};

const styles = StyleSheet.create({
    header: {
        marginVertical: 10,
        paddingHorizontal: MARGIN_HORIZONTAL,
    },
});
