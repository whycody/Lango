import React, { useState, useRef } from 'react';
import { SafeAreaView, StyleSheet, View, Animated } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useRoute, useTheme } from '@react-navigation/native';
import { ProgressBar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import CustomText from '../components/CustomText';
import WordLevelItem from '../components/WordLevelItem';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../src/constants';
import { useWords } from '../store/WordsContext';
import FlipCard from "react-native-flip-card";
import Card from "../components/Card";
import * as Haptics from "expo-haptics";

const SessionScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const route = useRoute();
  const length = route.params?.length || 1;
  const wordsContext = useWords();

  const pagerRef = useRef(null);
  const [cards] = useState(wordsContext.getWordSet(length * 10));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedStates, setFlippedStates] = useState(cards.map(() => false));

  const [scaleValues] = useState(cards.map(() => new Animated.Value(1)));

  const handlePageSelected = (e: any) => {
    setCurrentIndex(e.nativeEvent.position);
  };

  const decrementIndex = () => {
    if (currentIndex == 0) return;
    const nextIndex = currentIndex - 1;
    setCurrentIndex(nextIndex);
    pagerRef.current.setPage(nextIndex);
  };

  const renderCard = (word: any, wordIndex: number) => {
    const isActive = currentIndex === wordIndex;

    Animated.timing(scaleValues[wordIndex], {
      toValue: isActive ? 1 : 0.8,
      duration: 300,
      useNativeDriver: true,
    }).start();

    return (
      <FlipCard
        style={styles.card}
        flip={flippedStates[wordIndex]}
        flipHorizontal={true}
        flipVertical={false}
        alignHeight={true}
        alignWidth={true}
        friction={6}
      >
        <Animated.View style={[styles.cardContent, { transform: [{ scale: scaleValues[wordIndex] }] }]}>
          <Card
            currentIndex={currentIndex}
            wordIndex={wordIndex}
            text={word?.translation}
            onBackPress={decrementIndex}
            onEditPress={() => {
            }}
          />
        </Animated.View>
        <Animated.View style={[styles.cardContent, { transform: [{ scale: scaleValues[wordIndex] }] }]}>
          <Card
            currentIndex={currentIndex}
            wordIndex={wordIndex}
            text={word?.text}
            onBackPress={decrementIndex}
            onEditPress={() => {
            }}
          />
        </Animated.View>
      </FlipCard>
    );
  };

  const handleLevelPress = (level: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    (currentIndex === cards.length - 1) ? finishSession() : incrementIndex();
  }

  const finishSession = () => {

  }

  const incrementIndex = () => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    pagerRef.current.setPage(nextIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomText weight="SemiBold" style={styles.title}>
        {cards.length === 10
          ? t('shortSession')
          : cards.length === 20
            ? t('mediumSession')
            : t('longSession')}
      </CustomText>
      <ProgressBar progress={(currentIndex + 1) / cards.length} color={colors.primary} style={styles.progressBar}/>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        scrollEnabled={false}
        onPageSelected={handlePageSelected}
        pageMargin={10}
        orientation="vertical"
      >
        {cards.map((word, index) => (
          <View key={word.id} style={styles.pagerViewItem}>
            {renderCard(word, index)}
          </View>
        ))}
      </PagerView>
      <View style={styles.bottomBarContainer}>
        <CustomText weight="SemiBold" style={styles.headerText}>
          {t('howWell')}
        </CustomText>
        <View style={{ flexDirection: 'row', marginHorizontal: MARGIN_HORIZONTAL, marginBottom: MARGIN_VERTICAL }}>
          <WordLevelItem
            level={1}
            selected={false}
            style={{ flex: 1, marginRight: 6 }}
            onPress={() => handleLevelPress(1)}
          />
          <WordLevelItem
            level={2}
            selected={false}
            style={{ flex: 1, marginLeft: 3, marginRight: 3 }}
            onPress={() => handleLevelPress(2)}
          />
          <WordLevelItem
            level={3}
            selected={false}
            style={{ flex: 1, marginLeft: 6 }}
            onPress={() => handleLevelPress(3)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    pagerView: {
      flex: 1,
    },
    pagerViewItem: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    card: {
      height: '100%',
      marginVertical: MARGIN_VERTICAL,
      marginHorizontal: MARGIN_HORIZONTAL,
    },
    cardContent: {
      flex: 1,
      width: '100%',
    },
    title: {
      marginTop: MARGIN_VERTICAL,
      fontSize: 15,
      color: colors.primary300,
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    progressBar: {
      backgroundColor: colors.card,
      marginTop: 12,
      height: 3,
    },
    bottomBarContainer: {
      backgroundColor: colors.card,
    },
    headerText: {
      color: colors.primary300,
      textAlign: 'center',
      marginTop: MARGIN_VERTICAL,
      marginBottom: 20,
    },
  });
};

export default SessionScreen;