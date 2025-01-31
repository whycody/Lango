import { FlatList, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import CustomText from "../components/CustomText";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import StatisticItem from "../components/StatisticItem";
import { LANGO, useWords } from "../store/WordsContext";
import { useTranslation } from "react-i18next";
import ActionButton from "../components/ActionButton";
import HandleFlashcardBottomSheet from "../sheets/HandleFlashcardBottomSheet";
import { useCallback, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import FlashcardListItem from "../components/FlashcardListItem";
import AcceptationBottomSheet from "../sheets/AcceptationBottomSheet";

const FlashcardsScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const wordsContext = useWords();
  const numberOfWords = wordsContext.words.length;
  const langoWords = wordsContext.words.filter((word) => word.source == LANGO).length;

  const handleFlashcardBottomSheetRef = useRef<BottomSheetModal>(null);
  const acceptationBottomSheetRef = useRef<BottomSheetModal>(null);
  const [editFlashcardId, setEditFlashcardId] = useState<string | null>(null);

  const handleActionButtonPress = () => {
    setEditFlashcardId(null);
    handleFlashcardBottomSheetRef.current.present();
  }

  const handleEditPress = useCallback((id: string) => {
    setEditFlashcardId(id);
    handleFlashcardBottomSheetRef.current.present();
  }, []);

  const handleCancel = () => {
    acceptationBottomSheetRef.current.dismiss();
    setEditFlashcardId(null);
  }

  const removeFlashcard = () => {
    acceptationBottomSheetRef.current.close();
    wordsContext.removeWord(editFlashcardId);
    setEditFlashcardId(null);
  }

  const handleRemovePress = useCallback((id: string) => {
    setEditFlashcardId(id);
    acceptationBottomSheetRef.current.present();
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
      <AcceptationBottomSheet
        ref={acceptationBottomSheetRef}
        title={t('removingFlashcard')}
        description={t('removingFlashcardDesc', { text: wordsContext.getWord(editFlashcardId)?.text })}
        onAccept={removeFlashcard}
        onCancel={handleCancel}
      />
      <HandleFlashcardBottomSheet
        ref={handleFlashcardBottomSheetRef}
        flashcardId={editFlashcardId}
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
          data={wordsContext.words}
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