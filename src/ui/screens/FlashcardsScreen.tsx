import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Keyboard, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { RouteProp, useFocusEffect, useRoute, useTheme } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { GRADE_THREE_PROB_THRESHOLDS } from '../../constants/Evaluation';
import { MARGIN_HORIZONTAL } from '../../constants/margins';
import { WordSource } from '../../constants/Word';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { useUserPreferences, useWords, useWordsWithDetails } from '../../store';
import { WordWithDetails } from '../../types';
import { trackEvent } from '../../utils/analytics';
import { isIOS } from '../../utils/deviceUtils';
import { getSortingMethod } from '../../utils/sortingUtil';
import { ActionButton, BottomGradient, ModalDragHandle } from '../components';
import {
    EmptyList,
    FlashcardListItem,
    FlashcardsHeader,
    FlashcardsSubheader,
    ListFilter,
} from '../components/flashcards';
import { HandleFlashcardBottomSheet } from '../sheets/HandleFlashcardBottomSheet';
import { MasteryFilter, MasteryFilterBottomSheet } from '../sheets/MasteryFilterBottomSheet';
import { RemoveFlashcardBottomSheet } from '../sheets/RemoveFlashcardBottomSheet';
import { SortingMethodBottomSheet } from '../sheets/SortingMethodBottomSheet';
import { CustomTheme } from '../Theme';

const FLASHCARDS_HANDLE_FLASHCARD_BOTTOM_SHEET = 'flashcards-handle-flashcard-bottom-sheet';
const FLASHCARDS_MASTERY_FILTER_BOTTOM_SHEET = 'flashcards-mastery-filter-bottom-sheet';
const FLASHCARDS_REMOVE_FLASHCARD_BOTTOM_SHEET = 'flashcards-remove-flashcard-bottom-sheet';
const FLASHCARDS_SORTING_METHOD_BOTTOM_SHEET = 'flashcards-sorting-method-bottom-sheet';

export const FlashcardsScreen = () => {
    const { t } = useTranslation();
    const { colors } = useTheme() as CustomTheme;
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors, insets);
    const wordsContext = useWords();
    const wordWithDetailsContext = useWordsWithDetails();
    const numberOfWords = wordsContext.langWords.filter(word => !word.removed).length;
    const langoWords = wordsContext.langWords.filter(
        word => word.source == WordSource.LANGO && !word.removed,
    ).length;
    const { flashcardsSortingMethod } = useUserPreferences();
    const route = useRoute<RouteProp<RootStackParamList, 'Flashcards'>>();

    const [editFlashcardId, setEditFlashcardId] = useState<string | undefined>(undefined);
    const [filter, setFilter] = useState('');
    const [masteryFilter, setMasteryFilter] = useState<MasteryFilter>(
        route.params?.masteryFilter ?? 'all',
    );
    const [searchingMode, setSearchingMode] = useState(false);

    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (route.params?.masteryFilter) {
            setMasteryFilter(route.params.masteryFilter);
        }
    }, [route.params?.masteryFilter]);

    const allFlashcards = useMemo(
        () =>
            wordWithDetailsContext.langWordsWithDetails.filter(
                (word: WordWithDetails) => !word.removed,
            ),
        [wordWithDetailsContext.langWordsWithDetails],
    );

    const flashcards = useMemo(
        () =>
            wordWithDetailsContext.langWordsWithDetails
                .filter(
                    (word: WordWithDetails) =>
                        !word.removed &&
                        (!searchingMode ||
                            (filter.trim() &&
                                (word.text
                                    .trim()
                                    .toLowerCase()
                                    .includes(filter.trim().toLowerCase()) ||
                                    word.translation
                                        .trim()
                                        .toLowerCase()
                                        .includes(filter.trim().toLowerCase())))) &&
                        (searchingMode ||
                            masteryFilter === 'all' ||
                            (masteryFilter === 'learning' &&
                                word.gradeThreeProb <= GRADE_THREE_PROB_THRESHOLDS.BAD_MAX) ||
                            (masteryFilter === 'review' &&
                                word.gradeThreeProb > GRADE_THREE_PROB_THRESHOLDS.BAD_MAX &&
                                word.gradeThreeProb < GRADE_THREE_PROB_THRESHOLDS.GOOD_MIN) ||
                            (masteryFilter === 'mastered' &&
                                word.gradeThreeProb >= GRADE_THREE_PROB_THRESHOLDS.GOOD_MIN)),
                )
                .sort(getSortingMethod(flashcardsSortingMethod)),
        [
            searchingMode,
            flashcardsSortingMethod,
            filter,
            masteryFilter,
            wordWithDetailsContext.langWordsWithDetails,
        ],
    );

    const avgGradeThreeProb = useMemo(
        () =>
            allFlashcards.length > 0
                ? allFlashcards.reduce((sum, card) => sum + (card.gradeThreeProb || 0), 0) /
                  allFlashcards.length
                : 0,
        [allFlashcards],
    );

    const turnOffSearchingMode = () => {
        inputRef?.current?.blur();
        Keyboard.dismiss();
        setFilter('');
        setSearchingMode(false);
    };

    const turnOnSearchingMode = () => {
        setSearchingMode(true);
        setTimeout(() => inputRef?.current?.focus(), 100);
    };

    useFocusEffect(
        useCallback(() => {
            const handleBackPress = () => {
                if (!searchingMode) return false;
                turnOffSearchingMode();
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
            return () => subscription.remove();
        }, [searchingMode]),
    );

    const handleActionButtonPress = () => {
        setEditFlashcardId(undefined);
        trackEvent(AnalyticsEventName.HANDLE_FLASHCARD_SHEET_OPEN, {
            mode: 'add',
            source: 'flashcards_screen',
        });
        TrueSheet.present(FLASHCARDS_HANDLE_FLASHCARD_BOTTOM_SHEET);
    };

    const handlePress = useCallback(
        (id: string) => {
            if (flashcards) console.log(flashcards.find(f => f.id === id));
        },
        [flashcards],
    );

    const handleEditPress = useCallback((id: string) => {
        Keyboard.dismiss();
        setEditFlashcardId(id);
        trackEvent(AnalyticsEventName.HANDLE_FLASHCARD_SHEET_OPEN, {
            mode: 'edit',
            source: 'flashcards_screen',
        });
        TrueSheet.present(FLASHCARDS_HANDLE_FLASHCARD_BOTTOM_SHEET);
    }, []);

    const handleRemovePress = useCallback((id: string) => {
        Keyboard.dismiss();
        setEditFlashcardId(id);
        TrueSheet.present(FLASHCARDS_REMOVE_FLASHCARD_BOTTOM_SHEET);
    }, []);

    const handleCancel = () => {
        TrueSheet.dismiss(FLASHCARDS_REMOVE_FLASHCARD_BOTTOM_SHEET);
        setEditFlashcardId(undefined);
    };

    const removeFlashcard = () => {
        TrueSheet.dismiss(FLASHCARDS_REMOVE_FLASHCARD_BOTTOM_SHEET);
        if (!editFlashcardId) return;
        wordsContext.removeWord(editFlashcardId);
        setEditFlashcardId(undefined);
    };

    const renderFlashcardListItem = useCallback(
        ({ gradeThreeProb, id, text, translation }: WordWithDetails) => (
            <FlashcardListItem
                id={id}
                level={gradeThreeProb}
                text={text}
                translation={translation}
                onEditPress={handleEditPress}
                onPress={handlePress}
                onRemovePress={handleRemovePress}
            />
        ),
        [handleEditPress, handleRemovePress],
    );

    const renderHeader = useMemo(
        () => (
            <FlashcardsHeader
                allFlashcardsCount={allFlashcards.length}
                avgGradeThreeProb={avgGradeThreeProb}
                langoWords={langoWords}
                numberOfWords={numberOfWords}
            />
        ),
        [allFlashcards.length, avgGradeThreeProb, numberOfWords, langoWords],
    );

    const renderSubheader = useMemo(
        () => (
            <FlashcardsSubheader
                filterSheetName={FLASHCARDS_MASTERY_FILTER_BOTTOM_SHEET}
                masteryFilter={masteryFilter}
                sortingMethod={flashcardsSortingMethod}
                sortingSheetName={FLASHCARDS_SORTING_METHOD_BOTTOM_SHEET}
                onClearSearch={() => setFilter('')}
                onSearchPress={turnOnSearchingMode}
            />
        ),
        [flashcardsSortingMethod, masteryFilter],
    );

    const renderEmptyList = useMemo(
        () => (
            <EmptyList
                title={t(searchingMode ? 'empty_search' : 'no_items')}
                description={t(
                    searchingMode
                        ? filter
                            ? 'empty_search_desc'
                            : 'start_search_desc'
                        : 'no_items_desc',
                )}
            />
        ),
        [searchingMode, filter],
    );

    const renderSearchHeader = useMemo(
        () => (
            <View style={[styles.row, styles.searchHeaderContainer]}>
                <Ionicons
                    color={colors.white300}
                    name={'arrow-back-sharp'}
                    size={24}
                    style={styles.backIcon}
                    onPress={turnOffSearchingMode}
                />
                <ListFilter
                    isSearching={searchingMode}
                    ref={inputRef}
                    value={filter}
                    onChangeText={setFilter}
                    onClear={() => setFilter('')}
                    onFocus={searchingMode ? undefined : turnOnSearchingMode}
                />
            </View>
        ),
        [filter],
    );

    const renderListItem = ({ item }: { item: { id: string } }) => {
        if (item.id === 'header') return renderHeader;
        if (item.id === 'subheader') return renderSubheader;
        if (item.id === 'emptyList') return renderEmptyList;
        return renderFlashcardListItem(item as WordWithDetails);
    };

    const data = searchingMode
        ? [...(flashcards.length === 0 ? [{ id: 'emptyList' }] : []), ...flashcards]
        : [
              { id: 'header' },
              { id: 'subheader' },
              ...(flashcards.length === 0 ? [{ id: 'emptyList' }] : []),
              ...flashcards,
          ];

    return (
        <View style={styles.root}>
            <View style={styles.topSpacer}>
                <ModalDragHandle />
            </View>
            <RemoveFlashcardBottomSheet
                flashcardId={editFlashcardId}
                sheetName={FLASHCARDS_REMOVE_FLASHCARD_BOTTOM_SHEET}
                onCancel={handleCancel}
                onRemove={removeFlashcard}
            />
            <HandleFlashcardBottomSheet
                flashcardId={editFlashcardId}
                sheetName={FLASHCARDS_HANDLE_FLASHCARD_BOTTOM_SHEET}
            />
            <MasteryFilterBottomSheet
                sheetName={FLASHCARDS_MASTERY_FILTER_BOTTOM_SHEET}
                value={masteryFilter}
                onChange={setMasteryFilter}
            />
            <SortingMethodBottomSheet sheetName={FLASHCARDS_SORTING_METHOD_BOTTOM_SHEET} />
            {searchingMode && renderSearchHeader}
            <FlashList
                ListFooterComponent={<View style={{ height: 50 }} />}
                data={data}
                keyExtractor={item => item.id}
                keyboardDismissMode={'on-drag'}
                keyboardShouldPersistTaps={'always'}
                overScrollMode={'never'}
                renderItem={renderListItem}
                showsVerticalScrollIndicator={false}
                stickyHeaderHiddenOnScroll={false}
                stickyHeaderIndices={searchingMode || !flashcards.length ? undefined : [1]}
            />
            <BottomGradient />
            {!searchingMode && (
                <View style={styles.buttonContainer}>
                    <ActionButton
                        label={t('addWord')}
                        primary={true}
                        onPress={handleActionButtonPress}
                    />
                </View>
            )}
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors'], insets: EdgeInsets) =>
    StyleSheet.create({
        backIcon: {
            marginRight: 10,
        },
        buttonContainer: {
            backgroundColor: colors.card,
            paddingBottom: insets.bottom,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: 8,
            zIndex: 100,
        },
        root: {
            backgroundColor: colors.background,
            flex: 1,
            height: '100%',
        },
        row: {
            alignItems: 'center',
            flexDirection: 'row',
        },
        searchHeaderContainer: {
            backgroundColor: colors.background,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        topSpacer: {
            alignItems: 'center',
            backgroundColor: colors.background,
            height: isIOS ? 16 : insets.top,
            justifyContent: 'center',
        },
    });
