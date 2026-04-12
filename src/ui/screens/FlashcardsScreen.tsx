import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    BackHandler,
    Keyboard,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from 'react-native-paper';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { WordSource } from '../../constants/Word';
import { useUserPreferences, useWords, useWordsWithDetails } from '../../store';
import { WordWithDetails } from '../../types';
import { trackEvent } from '../../utils/analytics';
import { getSortingMethod, getSortingMethodLabel } from '../../utils/sortingUtil';
import { ActionButton, CustomText } from '../components';
import { EmptyList, FlashcardListItem, ListFilter } from '../components/flashcards';
import { StatisticItem } from '../components/home';
import {
    HandleFlashcardBottomSheet,
    RemoveFlashcardBottomSheet,
    SortingMethodBottomSheet,
} from '../sheets';

export const FlashcardsScreen = () => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors, insets);
    const wordsContext = useWords();
    const wordWithDetailsContext = useWordsWithDetails();
    const numberOfWords = wordsContext.langWords.filter(word => !word.removed).length;
    const langoWords = wordsContext.langWords.filter(
        word => word.source == WordSource.LANGO && !word.removed,
    ).length;
    const { flashcardsSortingMethod } = useUserPreferences();

    const handleFlashcardBottomSheetRef = useRef<BottomSheetModal>(null);
    const removeFlashcardBottomSheetRef = useRef<BottomSheetModal>(null);
    const sortingMethodBottomSheetRef = useRef<BottomSheetModal>(null);
    const [editFlashcardId, setEditFlashcardId] = useState<string | null>(null);
    const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);
    const [filter, setFilter] = useState('');

    const inputRef = useRef<TextInput>(null);
    const [searchingMode, setSearchingMode] = useState(false);

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
                                        .includes(filter.trim().toLowerCase())))),
                )
                .sort(getSortingMethod(flashcardsSortingMethod)),
        [
            searchingMode,
            flashcardsSortingMethod,
            filter,
            wordWithDetailsContext.langWordsWithDetails,
        ],
    );

    const avgGradeThreeProb = useMemo(
        () =>
            flashcards.length > 0
                ? flashcards.reduce((sum, card) => sum + (card.gradeThreeProb || 0), 0) /
                  flashcards.length
                : 0,
        [flashcards],
    );

    useEffect(() => {
        const handleBackPress = () => {
            if (searchingMode) {
                turnOffSearchingMode();
                return true;
            }
            if (bottomSheetIsShown) {
                handleFlashcardBottomSheetRef.current?.dismiss();
                removeFlashcardBottomSheetRef.current?.dismiss();
                sortingMethodBottomSheetRef.current?.dismiss();
                return true;
            }
            return false;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => subscription.remove();
    }, [searchingMode, bottomSheetIsShown]);

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

    const handleActionButtonPress = () => {
        setEditFlashcardId(null);
        trackEvent(AnalyticsEventName.HANDLE_FLASHCARD_SHEET_OPEN, {
            mode: 'add',
            source: 'flashcards_screen',
        });
        handleFlashcardBottomSheetRef.current.present();
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
        handleFlashcardBottomSheetRef.current.present();
    }, []);

    const handleCancel = () => {
        removeFlashcardBottomSheetRef.current.dismiss();
        setEditFlashcardId(null);
    };

    const removeFlashcard = () => {
        removeFlashcardBottomSheetRef.current.close();
        wordsContext.removeWord(editFlashcardId);
        setEditFlashcardId(null);
    };

    const handleRemovePress = useCallback((id: string) => {
        Keyboard.dismiss();
        setEditFlashcardId(id);
        removeFlashcardBottomSheetRef.current.present();
    }, []);

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

    const renderHeader = useMemo(() => {
        return (
            <View style={styles.headerCard}>
                <CustomText style={styles.title} weight="Bold">
                    {t('flashcards')}
                </CustomText>
                <CustomText style={styles.subtitle}>
                    {t('soFar', { wordsCount: numberOfWords }) +
                        ' ' +
                        (langoWords > 0 ? t('brag', { langoWords }) : t('nextTime'))}
                </CustomText>
                <View style={styles.statsContainer}>
                    <StatisticItem
                        description={t('words')}
                        icon={'layers-outline'}
                        label={`${numberOfWords}`}
                        style={styles.statisticItemFlex}
                    />
                    <StatisticItem
                        description={t('langoWords')}
                        icon={'layers-outline'}
                        label={`${langoWords}`}
                        style={styles.statisticItemFlex}
                    />
                </View>
                {flashcards.length > 0 && (
                    <>
                        <CustomText style={styles.subtitle}>
                            {t('avgGradeThree', {
                                avgGrade: (avgGradeThreeProb * 100).toFixed(0),
                            }) +
                                ' ' +
                                (avgGradeThreeProb >= 0.5 ? t('goodJob') : t('badJob'))}
                        </CustomText>
                        <View style={styles.progressBarContainer}>
                            <ProgressBar
                                animatedValue={avgGradeThreeProb}
                                color={colors.primary}
                                style={styles.progressBar}
                            />
                        </View>
                    </>
                )}
            </View>
        );
    }, [flashcards.length, numberOfWords, langoWords]);
    const renderSubheader = useMemo(() => {
        return (
            <View style={styles.subHeaderContainer}>
                <Pressable onPress={turnOnSearchingMode}>
                    <ListFilter
                        editable={false}
                        isSearching={searchingMode}
                        placeholder={t('searchFlashcard')}
                        placeholderTextColor={colors.primary600}
                        onClear={() => setFilter('')}
                    />
                </Pressable>
                <Pressable
                    style={styles.sortingHeader}
                    onPress={() => sortingMethodBottomSheetRef.current.present()}
                >
                    <MaterialCommunityIcons
                        color={colors.primary}
                        name={'sort-variant'}
                        size={18}
                    />
                    <CustomText style={styles.sortingLabel} weight={'SemiBold'}>
                        {getSortingMethodLabel(flashcardsSortingMethod)}
                    </CustomText>
                </Pressable>
            </View>
        );
    }, [searchingMode, flashcardsSortingMethod, filter, setFilter]);

    const renderEmptyList = useMemo(() => {
        return (
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
        );
    }, [searchingMode, filter]);

    const ListFilterHeader = useMemo(() => {
        return (
            <View style={[styles.row, styles.subHeaderContainer]}>
                <Ionicons
                    color={colors.primary300}
                    name={'arrow-back-sharp'}
                    size={24}
                    style={styles.backIcon}
                    onPress={turnOffSearchingMode}
                />
                <ListFilter
                    isSearching={searchingMode}
                    placeholder={t('searchFlashcard')}
                    placeholderTextColor={colors.primary600}
                    ref={inputRef}
                    value={filter}
                    onChangeText={setFilter}
                    onClear={() => setFilter('')}
                    onFocus={!searchingMode && turnOnSearchingMode}
                />
            </View>
        );
    }, [filter]);

    const renderListItem = ({ item }: { item: { id: string } }) => {
        if (item.id === 'header') return renderHeader;
        if (item.id === 'subheader') return renderSubheader;
        if (item.id === 'emptyList') return renderEmptyList;
        return renderFlashcardListItem(item as WordWithDetails);
    };

    const data = searchingMode
        ? [flashcards.length == 0 && { id: 'emptyList' }, ...flashcards]
        : [
              { id: 'header' },
              { id: 'subheader' },
              flashcards.length == 0 && { id: 'emptyList' },
              ...flashcards,
          ];

    return (
        <View style={styles.root}>
            <View style={styles.topSpacer} />
            <RemoveFlashcardBottomSheet
                flashcardId={editFlashcardId}
                ref={removeFlashcardBottomSheetRef}
                onCancel={handleCancel}
                onChangeIndex={index => setBottomSheetIsShown(index >= 0)}
                onRemove={removeFlashcard}
            />
            <HandleFlashcardBottomSheet
                flashcardId={editFlashcardId}
                ref={handleFlashcardBottomSheetRef}
                onChangeIndex={index => setBottomSheetIsShown(index >= 0)}
            />
            <SortingMethodBottomSheet
                ref={sortingMethodBottomSheetRef}
                onChangeIndex={index => setBottomSheetIsShown(index >= 0)}
            />
            {searchingMode && ListFilterHeader}
            <FlashList
                data={data.filter(Boolean)}
                estimatedItemSize={70}
                keyExtractor={item => item.id}
                keyboardDismissMode={'on-drag'}
                keyboardShouldPersistTaps={'always'}
                maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
                overScrollMode={'never'}
                renderItem={renderListItem}
                showsVerticalScrollIndicator={false}
                stickyHeaderHiddenOnScroll={false}
                stickyHeaderIndices={searchingMode ? undefined : [1]}
            />
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

const getStyles = (colors: any, insets: EdgeInsets) =>
    StyleSheet.create({
        backIcon: {
            marginRight: 10,
        },
        buttonContainer: {
            backgroundColor: colors.card,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: MARGIN_VERTICAL / 2,
        },
        headerCard: {
            backgroundColor: colors.card,
        },
        progressBar: {
            backgroundColor: colors.cardAccent300,
            height: 6,
        },
        progressBarContainer: {
            marginBottom: 6,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 16,
        },
        root: {
            flex: 1,
            height: '100%',
        },
        row: {
            alignItems: 'center',
            flexDirection: 'row',
        },
        sortingHeader: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: 8,
            paddingBottom: 8,
        },
        sortingLabel: {
            color: colors.primary,
            fontSize: 13,
        },
        statisticItem: {
            backgroundColor: colors.background,
            flex: 1,
        },
        statisticItemFlex: {
            flex: 1,
        },
        statsContainer: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 12,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        subHeaderContainer: {
            backgroundColor: colors.card,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        subtitle: {
            color: colors.primary600,
            fontSize: 15,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL / 3,
        },
        textInput: {
            backgroundColor: colors.background,
            color: colors.primary300,
            flex: 1,
            fontSize: 18,
            height: 50,
        },
        title: {
            color: colors.primary,
            fontSize: 24,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        topSpacer: {
            backgroundColor: colors.card,
            height: Platform.OS === 'ios' ? MARGIN_VERTICAL : insets.top,
        },
    });
