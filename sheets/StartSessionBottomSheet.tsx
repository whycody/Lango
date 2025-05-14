import React, { forwardRef, useCallback, useState } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import SessionLengthItem from "../components/items/SessionLengthItem";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Header from "../components/Header";
import CustomText from "../components/CustomText";
import SessionModeItem from "../components/items/SessionModeItem";

interface StartSessionBottomSheetProps {
  onSessionStart: (length: 1 | 2 | 3, mode: SESSION_MODE, flashcardSide: FLASHCARD_SIDE) => void,
  onChangeIndex?: (index: number) => void;
}

export enum SESSION_MODE {
  STUDY = 'STUDY',
  RANDOM = 'RANDOM',
  OLDEST = 'OLDEST'
}

export enum FLASHCARD_SIDE {
  WORD = 'WORD',
  TRANSLATION = 'TRANSLATION',
}

const StartSessionBottomSheet = forwardRef<BottomSheetModal, StartSessionBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [flashcardSide, setFlashcardSide] = useState<FLASHCARD_SIDE>(FLASHCARD_SIDE.WORD);
  const [sessionMode, setSessionMode] = useState<SESSION_MODE>(SESSION_MODE.STUDY)
  const [sessionLength, setSessionLength] = useState<1 | 2 | 3>(2)
  const { t } = useTranslation();

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const handleFlashcardSideItemPress = (flashcardSide: FLASHCARD_SIDE) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setFlashcardSide(flashcardSide);
  }

  const handleSessionModeItemPress = (mode: SESSION_MODE) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setSessionMode(mode);
  }

  const handleSessionLengthItemPress = (length: 1 | 2 | 3) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setSessionLength(length);
  }

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      onChange={(index: number) => props.onChangeIndex?.(index)}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
    >
      <BottomSheetScrollView style={styles.root}>
        <Header title={t('startSession')} style={styles.header}/>
        <CustomText style={styles.subtitle}>{t('choose_flashcard_side')}</CustomText>
        <View style={styles.sessionItemsContainer}>
          <SessionModeItem
            mode={FLASHCARD_SIDE.WORD}
            selected={flashcardSide === FLASHCARD_SIDE.WORD}
            onPress={() => handleFlashcardSideItemPress(FLASHCARD_SIDE.WORD)}
          />
          <SessionModeItem
            mode={FLASHCARD_SIDE.TRANSLATION}
            selected={flashcardSide === FLASHCARD_SIDE.TRANSLATION}
            onPress={() => handleFlashcardSideItemPress(FLASHCARD_SIDE.TRANSLATION)}
          />
        </View>
        <CustomText style={styles.subtitle}>{t('choose_session_mode')}</CustomText>
        <View style={styles.sessionItemsContainer}>
          <SessionModeItem
            mode={SESSION_MODE.STUDY}
            selected={sessionMode === SESSION_MODE.STUDY}
            onPress={() => handleSessionModeItemPress(SESSION_MODE.STUDY)}
          />
          <SessionModeItem
            mode={SESSION_MODE.RANDOM}
            selected={sessionMode === SESSION_MODE.RANDOM}
            onPress={() => handleSessionModeItemPress(SESSION_MODE.RANDOM)}
          />
          <SessionModeItem
            mode={SESSION_MODE.OLDEST}
            selected={sessionMode === SESSION_MODE.OLDEST}
            onPress={() => handleSessionModeItemPress(SESSION_MODE.OLDEST)}
          />
        </View>
        <CustomText style={styles.subtitle}>{t('sessionLength')}</CustomText>
        <View style={styles.sessionItemsContainer}>
          <SessionLengthItem
            length={1}
            selected={sessionLength === 1}
            onPress={() => handleSessionLengthItemPress(1)}
          />
          <SessionLengthItem
            length={2}
            selected={sessionLength === 2}
            onPress={() => handleSessionLengthItemPress(2)}
          />
          <SessionLengthItem
            length={3}
            selected={sessionLength === 3}
            onPress={() => handleSessionLengthItemPress(3)}
          />
        </View>
        <ActionButton
          onPress={() => props.onSessionStart(sessionLength, sessionMode, flashcardSide)}
          label={t('startSession')}
          primary={true}
          style={styles.button}
          icon={'play-sharp'}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    paddingHorizontal: MARGIN_HORIZONTAL,
  },
  header: {
    paddingTop: MARGIN_VERTICAL / 2,
  },
  subtitle: {
    color: colors.primary600,
    paddingTop: 15,
    paddingBottom: 3,
    fontSize: 14,
  },
  sessionItemsContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: 6,
    marginTop: 5,
  },
  button: {
    marginVertical: MARGIN_VERTICAL
  }
});

export default StartSessionBottomSheet;