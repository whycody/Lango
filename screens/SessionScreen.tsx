import React, { useState, useRef } from 'react';
import Swiper from 'react-native-deck-swiper';
import FlipCard from 'react-native-flip-card';
import { StyleSheet, View } from 'react-native';
import { useRoute, useTheme } from "@react-navigation/native";
import { useWords, Word } from "../store/WordsContext";
import { MARGIN_VERTICAL } from "../src/constants";
import { ProgressBar } from "react-native-paper";
import { useTranslation } from "react-i18next";
import CustomText from "../components/CustomText";
import Card from "../components/Card";

const SessionScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const wordsContext = useWords();

  const route = useRoute();
  const length = route.params?.length || 1;

  const swiperRef = useRef(null);
  const [cards] = useState(wordsContext.getWordSet(length * 10));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedStates, setFlippedStates] = useState(cards.map(() => false));

  const onSwiped = (index: number) => {
    setCurrentIndex(index + 1);
    const updatedFlippedStates = [...flippedStates];
    updatedFlippedStates[index] = false;
    setFlippedStates(updatedFlippedStates);
  };

  const handleSwipeBack = () => {
    if (currentIndex > 0) {
      swiperRef.current?.jumpToCardIndex(currentIndex - 1);
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const renderCard = (word: Word, wordIndex: number) => {
    return (
      <FlipCard
        key={word.id}
        style={styles.card}
        flip={flippedStates[wordIndex]}
        flipHorizontal={true}
        flipVertical={false}
        alignHeight={true}
        alignWidth={true}
        friction={6}
      >
        <Card
          currentIndex={currentIndex}
          wordIndex={wordIndex}
          text={word?.translation}
          onBackPress={handleSwipeBack}
          onEditPress={() => {}}
        />
        <Card
          currentIndex={currentIndex}
          wordIndex={wordIndex}
          text={word?.text}
          onBackPress={handleSwipeBack}
          onEditPress={() => {}}
        />
      </FlipCard>
    );
  }

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        cards={cards}
        onSwiped={onSwiped}
        renderCard={renderCard}
        disableTopSwipe={true}
        cardIndex={0}
        backgroundColor={'transparent'}
        stackSize={3}
      />
      <CustomText weight={"SemiBold"} style={styles.title}>
        {cards.length == 10 ? t('shortSession') : cards.length == 20 ? t('mediumSession') : t('longSession')}
      </CustomText>
      <ProgressBar progress={(currentIndex) / cards.length} color={colors.primary} style={styles.progressBar}/>
      <View style={{ flex: 1, zIndex: -1 }} />
      <View style={styles.bottomBarContainer}>
        <CustomText weight={"SemiBold"} style={styles.headerText}>
          {t('howWell')}
        </CustomText>
      </View>
    </View>
  );
};


const getStyles = (colors: any) => StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    marginTop: MARGIN_VERTICAL,
    zIndex: 3,
  },
  card: {
    marginTop: 0,
    marginBottom: 230,
    elevation: 10
  },
  title: {
    fontSize: 15,
    color: colors.primary300,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  progressBar: {
    backgroundColor: colors.card,
    marginTop: 12,
    height: 3
  },
  bottomBarContainer: {
    flex: 0.5,
    backgroundColor: colors.card
  },
  headerText: {
    color: colors.primary300,
    textAlign: 'center',
    marginTop: MARGIN_VERTICAL
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginRight: 5
  }
});

export default SessionScreen;
