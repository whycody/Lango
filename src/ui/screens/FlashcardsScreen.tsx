import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    BackHandler,
    Keyboard,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { RouteProp, useFocusEffect, useRoute, useTheme } from '@react-navigation/native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { GRADE_THREE_PROB_THRESHOLDS } from '../../constants/Evaluation';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../constants/margins';
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
    ScrollToTopButton,
} from '../components/flashcards';
import {
    FLASHCARD_DETAIL_BOTTOM_SHEET,
    FlashcardDetailBottomSheet,
} from '../sheets/FlashcardDetailBottomSheet';
import { HandleFlashcardBottomSheet } from '../sheets/HandleFlashcardBottomSheet';
import { MasteryFilter, MasteryFilterBottomSheet } from '../sheets/MasteryFilterBottomSheet';
import { MicrophonePermissionBottomSheet } from '../sheets/MicrophonePermissionBottomSheet';
import { RemoveFlashcardBottomSheet } from '../sheets/RemoveFlashcardBottomSheet';
import { SortingMethodBottomSheet } from '../sheets/SortingMethodBottomSheet';
import { CustomTheme } from '../Theme';

const FLASHCARDS_HANDLE_FLASHCARD_BOTTOM_SHEET = 'flashcards-handle-flashcard-bottom-sheet';
const FLASHCARDS_MASTERY_FILTER_BOTTOM_SHEET = 'flashcards-mastery-filter-bottom-sheet';
const FLASHCARDS_MICROPHONE_PERMISSION_SHEET = 'flashcards-microphone-permission';
const FLASHCARDS_REMOVE_FLASHCARD_BOTTOM_SHEET = 'flashcards-remove-flashcard-bottom-sheet';
const FLASHCARDS_SORTING_METHOD_BOTTOM_SHEET = 'flashcards-sorting-method-bottom-sheet';

const SCROLL_TO_TOP_THRESHOLD = 300;

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
    const [detailWord, setDetailWord] = useState<WordWithDetails | undefined>(undefined);
    const [filter, setFilter] = useState('');
    const [masteryFilter, setMasteryFilter] = useState<MasteryFilter>(
        route.params?.masteryFilter ?? 'all',
    );
    const [searchingMode, setSearchingMode] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const listRef = useRef<FlashListRef<{ id: string }>>(null);
    const lastScrollY = useRef(0);
    const addButtonAnim = useRef(new Animated.Value(1)).current;
    const scrollToTopAnim = useRef(new Animated.Value(0)).current;
    const addButtonVisible = useRef(true);
    const scrollToTopVisible = useRef(false);

    const animateTo = useCallback((anim: Animated.Value, toValue: number) => {
        Animated.timing(anim, {
            duration: 200,
            toValue,
            useNativeDriver: true,
        }).start();
    }, []);

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

    const matchesSearchQuery = useCallback(
        (word: WordWithDetails) => {
            const query = filter.trim().toLowerCase();
            if (!query) return false;
            return (
                word.text.trim().toLowerCase().includes(query) ||
                word.translation.trim().toLowerCase().includes(query)
            );
        },
        [filter],
    );

    const matchesMasteryFilter = useCallback(
        (word: WordWithDetails) => {
            if (masteryFilter === 'all') return true;
            if (masteryFilter === 'learning')
                return word.gradeThreeProb <= GRADE_THREE_PROB_THRESHOLDS.BAD_MAX;
            if (masteryFilter === 'review')
                return (
                    word.gradeThreeProb > GRADE_THREE_PROB_THRESHOLDS.BAD_MAX &&
                    word.gradeThreeProb < GRADE_THREE_PROB_THRESHOLDS.GOOD_MIN
                );
            if (masteryFilter === 'mastered')
                return word.gradeThreeProb >= GRADE_THREE_PROB_THRESHOLDS.GOOD_MIN;
            return true;
        },
        [masteryFilter],
    );

    const flashcards = useMemo(
        () =>
            wordWithDetailsContext.langWordsWithDetails
                .filter((word: WordWithDetails) => {
                    if (word.removed) return false;
                    if (searchingMode) return matchesSearchQuery(word);
                    return matchesMasteryFilter(word);
                })
                .sort(getSortingMethod(flashcardsSortingMethod)),
        [
            searchingMode,
            flashcardsSortingMethod,
            matchesSearchQuery,
            matchesMasteryFilter,
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

    const resetScrollButtonVisibility = () => {
        animateTo(scrollToTopAnim, 0);
        scrollToTopVisible.current = false;
    };

    const showAddButton = () => {
        animateTo(addButtonAnim, 1);
        addButtonVisible.current = true;
    };

    const turnOffSearchingMode = () => {
        inputRef?.current?.blur();
        Keyboard.dismiss();
        setFilter('');
        setSearchingMode(false);
        listRef.current?.scrollToOffset({ animated: false, offset: 0 });
        resetScrollButtonVisibility();
        showAddButton();
    };

    const turnOnSearchingMode = () => {
        setSearchingMode(true);
        resetScrollButtonVisibility();
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

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            const scrollingDown = offsetY > lastScrollY.current + 5;
            const scrollingUp = offsetY < lastScrollY.current - 5;
            lastScrollY.current = offsetY;

            if (scrollingDown && addButtonVisible.current) {
                addButtonVisible.current = false;
                animateTo(addButtonAnim, 0);
            } else if (scrollingUp && !addButtonVisible.current) {
                addButtonVisible.current = true;
                animateTo(addButtonAnim, 1);
            }

            const shouldShowScrollToTop = offsetY > SCROLL_TO_TOP_THRESHOLD;
            if (shouldShowScrollToTop !== scrollToTopVisible.current) {
                scrollToTopVisible.current = shouldShowScrollToTop;
                animateTo(scrollToTopAnim, shouldShowScrollToTop ? 1 : 0);
            }
        },
        [addButtonAnim, scrollToTopAnim, animateTo],
    );

    const handleScrollToTop = useCallback(() => {
        listRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }, []);

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
            const word = flashcards.find(f => f.id === id);
            if (!word) return;
            setDetailWord(word);
            TrueSheet.present(FLASHCARD_DETAIL_BOTTOM_SHEET);
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

    const handleWordEdit = useCallback(
        (id: string | undefined, word: string, translation: string) => {
            if (!id) return;
            setDetailWord(prev => (prev?.id === id ? { ...prev, text: word, translation } : prev));
        },
        [],
    );

    const handleCancel = () => {
        TrueSheet.dismiss(FLASHCARDS_REMOVE_FLASHCARD_BOTTOM_SHEET);
        setEditFlashcardId(undefined);
    };

    const removeFlashcard = () => {
        TrueSheet.dismiss(FLASHCARDS_REMOVE_FLASHCARD_BOTTOM_SHEET);
        TrueSheet.dismiss(FLASHCARD_DETAIL_BOTTOM_SHEET);
        if (!editFlashcardId) return;
        wordsContext.removeWord(editFlashcardId);
        setEditFlashcardId(undefined);
        setDetailWord(undefined);
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
                        : masteryFilter !== 'all'
                          ? 'no_items_filter_desc'
                          : 'no_items_desc',
                )}
            />
        ),
        [searchingMode, filter, masteryFilter],
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
            <FlashcardDetailBottomSheet
                word={detailWord}
                onEdit={detailWord ? () => handleEditPress(detailWord.id) : undefined}
                onRemove={detailWord ? () => handleRemovePress(detailWord.id) : undefined}
            />
            <RemoveFlashcardBottomSheet
                flashcardId={editFlashcardId}
                sheetName={FLASHCARDS_REMOVE_FLASHCARD_BOTTOM_SHEET}
                onCancel={handleCancel}
                onRemove={removeFlashcard}
            />
            <MicrophonePermissionBottomSheet sheetName={FLASHCARDS_MICROPHONE_PERMISSION_SHEET} />
            <HandleFlashcardBottomSheet
                flashcardId={editFlashcardId}
                microphonePermissionSheetName={FLASHCARDS_MICROPHONE_PERMISSION_SHEET}
                sheetName={FLASHCARDS_HANDLE_FLASHCARD_BOTTOM_SHEET}
                onWordEdit={handleWordEdit}
            />
            <MasteryFilterBottomSheet
                sheetName={FLASHCARDS_MASTERY_FILTER_BOTTOM_SHEET}
                value={masteryFilter}
                onChange={setMasteryFilter}
            />
            <SortingMethodBottomSheet sheetName={FLASHCARDS_SORTING_METHOD_BOTTOM_SHEET} />
            {searchingMode && renderSearchHeader}
            <FlashList
                key={searchingMode ? 'search' : 'normal'}
                ListFooterComponent={<View style={{ height: 16 }} />}
                data={data}
                keyExtractor={item => item.id}
                keyboardDismissMode={'on-drag'}
                keyboardShouldPersistTaps={'always'}
                overScrollMode={'never'}
                ref={listRef}
                renderItem={renderListItem}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                stickyHeaderHiddenOnScroll={false}
                stickyHeaderIndices={searchingMode || !flashcards.length ? undefined : [1]}
                onScroll={handleScroll}
            />
            <BottomGradient />
            {!searchingMode && (
                <Animated.View
                    style={[
                        styles.buttonContainer,
                        {
                            opacity: addButtonAnim,
                            transform: [
                                {
                                    translateY: addButtonAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [80, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <ActionButton
                        label={t('addWord')}
                        primary={true}
                        onPress={handleActionButtonPress}
                    />
                </Animated.View>
            )}
            <ScrollToTopButton
                addButtonAnim={addButtonAnim}
                animatedValue={scrollToTopAnim}
                onPress={handleScrollToTop}
            />
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
            borderRadius: spacing.l,
            bottom: 0,
            left: 0,
            paddingBottom: insets.bottom,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: MARGIN_VERTICAL / 2,
            position: 'absolute',
            right: 0,
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
