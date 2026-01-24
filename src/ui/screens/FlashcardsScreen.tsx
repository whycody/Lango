import { BackHandler, Keyboard, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import CustomText from "../components/CustomText";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import StatisticItem from "../components/items/StatisticItem";
import { useWords, WordSource } from "../../store/WordsContext";
import { useTranslation } from "react-i18next";
import ActionButton from "../components/ActionButton";
import HandleFlashcardBottomSheet from "../sheets/HandleFlashcardBottomSheet";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import FlashcardListItem from "../components/items/FlashcardListItem";
import RemoveFlashcardBottomSheet from "../sheets/RemoveFlashcardBottomSheet";
import { FlashList } from "@shopify/flash-list";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ListFilter from "../components/ListFilter";
import { WordWithDetails } from "../../types";
import { useWordsWithDetails } from "../../store/WordsWithDetailsContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyList from "../components/EmptyList";
import { ProgressBar } from "react-native-paper";
import { useUserPreferences } from "../../store/UserPreferencesContext";
import { getSortingMethod, getSortingMethodLabel } from "../../utils/sortingUtil";
import SortingMethodBottomSheet from "../sheets/SortingMethodBottomSheet";

const FlashcardsScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const wordsContext = useWords();
  const wordWithDetailsContext = useWordsWithDetails();
  const numberOfWords = wordsContext.langWords.filter((word) => !word.removed).length;
  const langoWords = wordsContext.langWords.filter((word) => word.source == WordSource.LANGO && !word.removed).length;
  const { flashcardsSortingMethod } = useUserPreferences();

  const handleFlashcardBottomSheetRef = useRef<BottomSheetModal>(null);
  const removeFlashcardBottomSheetRef = useRef<BottomSheetModal>(null);
  const sortingMethodBottomSheetRef = useRef<BottomSheetModal>(null);
  const [editFlashcardId, setEditFlashcardId] = useState<string | null>(null);
  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);
  const [filter, setFilter] = useState('');

  const inputRef = useRef<TextInput>(null);
  const [searchingMode, setSearchingMode] = useState(false);
  const insets = useSafeAreaInsets();

  const flashcards = useMemo(() =>
      wordWithDetailsContext.langWordsWithDetails.filter((word: WordWithDetails) =>
        !word.removed && (!searchingMode || (filter.trim() && (
          word.text.trim().toLowerCase().includes(filter.trim().toLowerCase()) ||
          word.translation.trim().toLowerCase().includes(filter.trim().toLowerCase()))))
      ).sort(getSortingMethod(flashcardsSortingMethod)),
    [searchingMode, flashcardsSortingMethod, filter, wordWithDetailsContext.langWordsWithDetails]);

  const avgGradeThreeProb = useMemo(() => (
    flashcards.length > 0
      ? flashcards.reduce((sum, card) => sum + (card.gradeThreeProb || 0), 0) / flashcards.length
      : 0
  ), [flashcards]);

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

    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => subscription.remove();
  }, [searchingMode, bottomSheetIsShown]);

  const turnOffSearchingMode = () => {
    inputRef?.current?.blur();
    Keyboard.dismiss();
    setFilter('');
    setSearchingMode(false);
  }

  const turnOnSearchingMode = () => {
    setSearchingMode(true);
    setTimeout(() => inputRef?.current?.focus(), 100);
  }

  const handleActionButtonPress = () => {
    setEditFlashcardId(null);
    handleFlashcardBottomSheetRef.current.present();
  }

  const handlePress = useCallback((id: string) => {
    if (!!flashcards) console.log(flashcards.find((f) => f.id === id));
  }, [flashcards]);

  const handleEditPress = useCallback((id: string) => {
    Keyboard.dismiss();
    setEditFlashcardId(id);
    handleFlashcardBottomSheetRef.current.present();
  }, []);

  const handleCancel = () => {
    removeFlashcardBottomSheetRef.current.dismiss();
    setEditFlashcardId(null);
  }

  const removeFlashcard = () => {
    removeFlashcardBottomSheetRef.current.close();
    wordsContext.removeWord(editFlashcardId);
    setEditFlashcardId(null);
  }

  const handleRemovePress = useCallback((id: string) => {
    Keyboard.dismiss();
    setEditFlashcardId(id);
    removeFlashcardBottomSheetRef.current.present();
  }, []);

  const renderFlashcardListItem = useCallback(({ id, text, translation, gradeThreeProb }: WordWithDetails) => (
    <FlashcardListItem
      id={id}
      text={text}
      level={gradeThreeProb}
      translation={translation}
      onPress={handlePress}
      onEditPress={handleEditPress}
      onRemovePress={handleRemovePress}
    />
  ), [handleEditPress, handleRemovePress]);

  const renderHeader = useMemo(() => {
        return (
          <View style={{ backgroundColor: colors.card }}>
            <CustomText weight="Bold" style={styles.title}>{t('flashcards')}</CustomText>
            <CustomText style={styles.subtitle}>
              {t('soFar', { wordsCount: numberOfWords }) + ' ' +
                (langoWords > 0 ? t('brag', { langoWords: langoWords }) : t('nextTime'))}
            </CustomText>
            <View style={styles.statsContainer}>
              <StatisticItem
                icon={'layers-outline'}
                label={`${numberOfWords}`}
                description={t('words')}
                style={{ flex: 1 }}
              />
              <StatisticItem
                icon={'layers-outline'}
                label={`${langoWords}`}
                description={t('langoWords')}
                style={{ flex: 1 }}
              />
            </View>
            {flashcards.length > 0 &&
              <>
                <CustomText style={styles.subtitle}>
                  {(t('avgGradeThree', { avgGrade: (avgGradeThreeProb * 100).toFixed(0) }) + ' ' +
                    (avgGradeThreeProb >= 0.5 ? t('goodJob') : t('badJob')))}
                </CustomText>
                <View style={styles.progressBarContainer}>
                  <ProgressBar
                    animatedValue={avgGradeThreeProb}
                    color={colors.primary}
                    style={styles.progressBar}
                  />
                </View>
              </>
            }
          </View>
        )
          ;
      }, [flashcards.length, numberOfWords, langoWords]
    )
  ;

  const renderSubheader = useMemo(() => {
    return (
      <View style={styles.subHeaderContainer}>
        <Pressable onPress={turnOnSearchingMode}>
          <ListFilter
            isSearching={searchingMode}
            editable={false}
            onClear={() => setFilter("")}
            placeholder={t("searchFlashcard")}
            placeholderTextColor={colors.primary600}
          />
        </Pressable>
        <Pressable style={styles.sortingHeader} onPress={() => sortingMethodBottomSheetRef.current.present()}>
          <MaterialCommunityIcons name={'sort-variant'} color={colors.primary} size={18}/>
          <CustomText
            weight={'SemiBold'}
            style={styles.sortingLabel}
          >
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
        description={t(searchingMode ? filter ? 'empty_search_desc' : 'start_search_desc' : 'no_items_desc')}
      />
    )
  }, [searchingMode, filter]);

  const ListFilterHeader = useMemo(() => {
    return (
      <View style={[styles.row, styles.subHeaderContainer]}>
        <Ionicons
          name={'arrow-back-sharp'}
          size={24}
          color={colors.primary300}
          style={{ marginRight: 10 }}
          onPress={turnOffSearchingMode}
        />
        <ListFilter
          ref={inputRef}
          isSearching={searchingMode}
          value={filter}
          onChangeText={setFilter}
          onFocus={!searchingMode && turnOnSearchingMode}
          onClear={() => setFilter("")}
          placeholder={t("searchFlashcard")}
          placeholderTextColor={colors.primary600}
        />
      </View>
    )
  }, [filter]);

  const renderListItem = ({ item }: { item: { id: string } }) => {
    if (item.id === "header") return renderHeader;
    if (item.id === "subheader") return renderSubheader;
    if (item.id === 'emptyList') return renderEmptyList;
    return renderFlashcardListItem(item as WordWithDetails);
  };

  const data = searchingMode ?
    [flashcards.length == 0 && { id: 'emptyList' }, ...flashcards] :
    [{ id: 'header' }, { id: 'subheader' }, flashcards.length == 0 && { id: 'emptyList' }, ...flashcards];

  return (
    <View style={styles.root}>
      <View style={{ height: Platform.OS === 'ios' ? MARGIN_VERTICAL : insets.top, backgroundColor: colors.card }}/>
      <RemoveFlashcardBottomSheet
        ref={removeFlashcardBottomSheetRef}
        flashcardId={editFlashcardId}
        onRemove={removeFlashcard}
        onCancel={handleCancel}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
      />
      <HandleFlashcardBottomSheet
        ref={handleFlashcardBottomSheetRef}
        flashcardId={editFlashcardId}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
      />
      <SortingMethodBottomSheet
        ref={sortingMethodBottomSheetRef}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
      />
      {searchingMode && ListFilterHeader}
      <FlashList
        data={data.filter(Boolean)}
        renderItem={renderListItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        estimatedItemSize={70}
        stickyHeaderHiddenOnScroll={false}
        stickyHeaderIndices={searchingMode ? undefined : [1]}
        keyboardShouldPersistTaps={"always"}
        maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
        overScrollMode={"never"}
        keyboardDismissMode={"on-drag"}
      />
      {!searchingMode && <View style={styles.buttonContainer}>
        <ActionButton label={t('addWord')} primary={true} onPress={handleActionButtonPress}/>
      </View>
      }
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    height: '100%'
  },
  title: {
    marginTop: MARGIN_VERTICAL,
    marginHorizontal: MARGIN_HORIZONTAL,
    color: colors.primary,
    fontSize: 24,
  },
  subtitle: {
    color: colors.primary600,
    marginHorizontal: MARGIN_HORIZONTAL,
    marginTop: MARGIN_VERTICAL / 3,
    fontSize: 15
  },
  subHeaderContainer: {
    backgroundColor: colors.card,
    paddingHorizontal: MARGIN_HORIZONTAL,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    height: 50,
    fontSize: 18,
    color: colors.primary300,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: MARGIN_HORIZONTAL,
    marginTop: MARGIN_VERTICAL,
    marginBottom: 12,
    gap: 12,
  },
  buttonContainer: {
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingVertical: MARGIN_VERTICAL / 2,
    backgroundColor: colors.card,
  },
  statisticItem: {
    flex: 1,
    backgroundColor: colors.background
  },
  progressBar: {
    backgroundColor: colors.cardAccent300,
    height: 6,
  },
  progressBarContainer: {
    marginTop: 16,
    marginBottom: 6,
    marginHorizontal: MARGIN_HORIZONTAL,
  },
  sortingHeader: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
    alignItems: 'center',
  },
  sortingLabel: {
    color: colors.primary,
    fontSize: 13
  }
});

export default FlashcardsScreen;