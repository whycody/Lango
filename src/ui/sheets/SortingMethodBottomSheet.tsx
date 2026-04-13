import React, { ForwardedRef, forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL } from '../../constants/margins';
import { FlashcardSortingMethod } from '../../constants/UserPreferences';
import { useUserPreferences } from '../../store';
import { getSortingMethodLabel } from '../../utils/sortingUtil';
import { Header } from '../components';
import { SortingMethodItem } from '../components/flashcards';
import { CustomTheme } from '../Theme';

type SortingMethodBottomSheetProps = {
    onChangeIndex?: (index: number) => void;
};

export const SortingMethodBottomSheet = forwardRef<BottomSheetModal, SortingMethodBottomSheetProps>(
    (props, ref: ForwardedRef<BottomSheetModal>) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);
        const { t } = useTranslation();
        const { flashcardsSortingMethod, setFlashcardsSortingMethod } = useUserPreferences();

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />
            ),
            [],
        );

        const sortingMethods = useMemo(
            () =>
                Object.values(FlashcardSortingMethod).filter(
                    v => typeof v === 'number',
                ) as FlashcardSortingMethod[],
            [],
        );

        const dismiss = () => {
            ref && typeof ref !== 'function' && ref.current?.dismiss();
        };

        const handlePress = useCallback(
            (method: FlashcardSortingMethod) => {
                setFlashcardsSortingMethod(method);
                dismiss();
            },
            [ref, setFlashcardsSortingMethod],
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
            [handlePress, flashcardsSortingMethod],
        );

        return (
            <BottomSheetModal
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.bottomSheetModal}
                handleIndicatorStyle={styles.handleIndicatorStyle}
                index={0}
                ref={ref}
                onChange={(index: number) => props.onChangeIndex?.(index)}
            >
                <BottomSheetScrollView>
                    <Header
                        style={styles.header}
                        subtitle={t('sorting.desc')}
                        title={t('sorting.title')}
                    />
                    <FlashList
                        data={sortingMethods}
                        estimatedItemSize={55}
                        extraData={flashcardsSortingMethod}
                        renderItem={renderItem}
                    />
                </BottomSheetScrollView>
            </BottomSheetModal>
        );
    },
);

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        bottomSheetModal: {
            backgroundColor: colors.card,
        },
        handleIndicatorStyle: {
            backgroundColor: colors.primary,
            borderRadius: 0,
        },
        header: {
            marginVertical: 10,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
    });
