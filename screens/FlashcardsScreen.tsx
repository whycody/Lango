import { BackHandler, Keyboard, SafeAreaView, StyleSheet, TextInput, View } from "react-native";
import CustomText from "../components/CustomText";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import StatisticItem from "../components/items/StatisticItem";
import { LANGO, useWords } from "../store/WordsContext";
import { useTranslation } from "react-i18next";
import ActionButton from "../components/ActionButton";
import HandleFlashcardBottomSheet from "../sheets/HandleFlashcardBottomSheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import FlashcardListItem from "../components/items/FlashcardListItem";
import RemoveFlashcardBottomSheet from "../sheets/RemoveFlashcardBottomSheet";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import ListFilter from "../components/ListFilter";
import { Word } from "../store/types";

const FlashcardsScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const wordsContext = useWords();
  const numberOfWords = wordsContext.langWords.filter((word) => !word.removed).length;
  const langoWords = wordsContext.langWords.filter((word) => word.source == LANGO && !word.removed).length;

  const handleFlashcardBottomSheetRef = useRef<BottomSheetModal>(null);
  const removeFlashcardBottomSheetRef = useRef<BottomSheetModal>(null);
  const [editFlashcardId, setEditFlashcardId] = useState<string | null>(null);
  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);
  const [filter, setFilter] = useState('');

  const inputRef = useRef<TextInput>(null);
  const [searchingMode, setSearchingMode] = useState(false);

  const flashcards = useMemo(() => wordsContext.langWords.filter((word: Word) =>
      !word.removed && (!searchingMode || (filter.trim() && (
        word.text.trim().toLowerCase().includes(filter.trim().toLowerCase()) ||
        word.translation.trim().toLowerCase().includes(filter.trim().toLowerCase()))))
    ).sort((a, b) => new Date(b.locallyUpdatedAt).getTime() - new Date(a.locallyUpdatedAt).getTime()),
    [searchingMode, filter, wordsContext.langWords]);

  useEffect(() => {
    const handleBackPress = () => {
      if (searchingMode) {
        turnOffSearchingMode();
        return true;
      }
      if (bottomSheetIsShown) {
        handleFlashcardBottomSheetRef.current?.dismiss();
        removeFlashcardBottomSheetRef.current?.dismiss();
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
  }

  const handleActionButtonPress = () => {
    setEditFlashcardId(null);
    handleFlashcardBottomSheetRef.current.present();
  }

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

  const renderFlashcardListItem = useCallback(({ id, text, translation }: Word) => (
    <FlashcardListItem
      id={id}
      text={text}
      translation={translation}
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
      </View>
    );
  }, []);

  const renderSubheader = useMemo(() => {
    return (
      <View style={styles.subHeaderContainer}>
        {searchingMode &&
          <Ionicons
            name={'arrow-back-sharp'}
            size={24}
            color={colors.primary300}
            style={{ marginRight: 10 }}
            onPress={turnOffSearchingMode}
          />
        }
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
    );
  }, [searchingMode, filter, setFilter]);

  const renderListItem = ({ item }: { item: { id: string } }) => {
    if (item.id === "header") return renderHeader;
    if (item.id === "subheader") return renderSubheader;
    return renderFlashcardListItem(item as Word);
  };

  const data = searchingMode ? [{ id: 'subheader' }, ...flashcards] : [{ id: 'header' }, { id: 'subheader' }, ...flashcards];

  return (
    <SafeAreaView style={styles.root}>
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
      <FlashList
        data={data}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={70}
        stickyHeaderHiddenOnScroll={false}
        stickyHeaderIndices={searchingMode ? [0] : [1]}
        keyboardShouldPersistTaps={"always"}
        maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
        overScrollMode={"never"}
        keyboardDismissMode={"on-drag"}
      />
      {!searchingMode && <View style={styles.buttonContainer}>
        <ActionButton label={t('addWord')} primary={true} onPress={handleActionButtonPress}/>
      </View>
      }
    </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center'
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
    marginBottom: 5,
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
  }
});

export default FlashcardsScreen;