import { BackHandler, FlatList, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import CustomText from "../components/CustomText";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import StatisticItem from "../components/items/StatisticItem";
import { LANGO, useWords } from "../store/WordsContext";
import { useTranslation } from "react-i18next";
import ActionButton from "../components/ActionButton";
import HandleFlashcardBottomSheet from "../sheets/HandleFlashcardBottomSheet";
import { useCallback, useEffect, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import FlashcardListItem from "../components/items/FlashcardListItem";
import RemoveFlashcardBottomSheet from "../sheets/RemoveFlashcardBottomSheet";

const FlashcardsScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const wordsContext = useWords();
  const numberOfWords = wordsContext.langWords.length;
  const langoWords = wordsContext.langWords.filter((word) => word.source == LANGO).length;

  const handleFlashcardBottomSheetRef = useRef<BottomSheetModal>(null);
  const removeFlashcardBottomSheetRef = useRef<BottomSheetModal>(null);
  const [editFlashcardId, setEditFlashcardId] = useState<string | null>(null);
  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);

  useEffect(() => {
    const handleBackPress = () => {
      if (bottomSheetIsShown) {
        handleFlashcardBottomSheetRef.current?.dismiss();
        removeFlashcardBottomSheetRef.current?.dismiss();
        return true;
      }
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => subscription.remove();
  }, [bottomSheetIsShown]);

  const handleActionButtonPress = () => {
    setEditFlashcardId(null);
    handleFlashcardBottomSheetRef.current.present();
  }

  const handleEditPress = useCallback((id: string) => {
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
    setEditFlashcardId(id);
    removeFlashcardBottomSheetRef.current.present();
  }, []);

  const renderFlashcardListItem = ({ item, index }) => {
    return (
      <FlashcardListItem
        id={item.id}
        index={index}
        text={item.text}
        translation={item.translation}
        onEditPress={handleEditPress}
        onRemovePress={handleRemovePress}
      />
    );
  }

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
      <ScrollView>
        <CustomText weight={"Bold"} style={styles.title}>{t('flashcards')}</CustomText>
        <CustomText style={styles.subtitle}>
          {t('soFar', { wordsCount: numberOfWords }) + ' ' + (langoWords > 0 ? t('brag', { langoWords: langoWords }) : t('nextTime'))}
        </CustomText>
        <View style={styles.statsContainer}>
          <StatisticItem label={`${numberOfWords}`} description={t('words')} style={{ flex: 1, marginRight: 6 }}/>
          <StatisticItem label={`${langoWords}`} description={t('langoWords')} style={{ flex: 1, marginLeft: 6 }}/>
        </View>
        <FlatList
          data={wordsContext.langWords}
          scrollEnabled={false}
          style={{ marginTop: MARGIN_VERTICAL }}
          renderItem={renderFlashcardListItem}
        />
      </ScrollView>
      <ActionButton label={t('addWord')} primary={true} style={styles.button} onPress={handleActionButtonPress}/>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
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
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: MARGIN_HORIZONTAL,
    marginTop: 15
  },
  button: {
    marginHorizontal: MARGIN_HORIZONTAL,
    marginVertical: MARGIN_VERTICAL / 2
  }
});

export default FlashcardsScreen;