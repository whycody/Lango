import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import SessionLengthItem from "../components/items/SessionLengthItem";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Header from "../components/Header";
import CustomText from "../components/CustomText";
import SessionModeItem from "../components/items/SessionModeItem";
import { FlashcardSide, SessionLength, useUserPreferences } from "../../store/UserPreferencesContext";
import { SessionMode } from "../../types";
import { useHaptics } from "../../hooks/useHaptics";

interface StartSessionBottomSheetProps {
  onSessionStart: (length: SessionLength, mode: SessionMode, flashcardSide: FlashcardSide) => void,
  onChangeIndex?: (index: number) => void;
}

export const StartSessionBottomSheet = forwardRef<BottomSheetModal, StartSessionBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const userPreferences = useUserPreferences();
  const [flashcardSide, setFlashcardSide] = useState<FlashcardSide>(userPreferences.flashcardSide);
  const [sessionMode, setSessionMode] = useState<SessionMode>(userPreferences.sessionMode);
  const [sessionLength, setSessionLength] = useState<SessionLength>(userPreferences.sessionLength);
  const { triggerHaptics } = useHaptics();
  const { t } = useTranslation();

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  useEffect(() => {
    setFlashcardSide(userPreferences.flashcardSide);
    setSessionMode(userPreferences.sessionMode);
    setSessionLength(userPreferences.sessionLength);
  }, [userPreferences.flashcardSide, userPreferences.sessionMode, userPreferences.sessionLength]);

  const handleFlashcardSideItemPress = (flashcardSide: FlashcardSide) => {
    triggerHaptics(Haptics.ImpactFeedbackStyle.Soft);
    setFlashcardSide(flashcardSide);
  }

  const handleSessionModeItemPress = (mode: SessionMode) => {
    triggerHaptics(Haptics.ImpactFeedbackStyle.Soft);
    setSessionMode(mode);
  }

  const handleSessionLengthItemPress = (length: SessionLength) => {
    triggerHaptics(Haptics.ImpactFeedbackStyle.Soft);
    setSessionLength(length);
  }

  const handleActionButtonPress = async () => {
    userPreferences.setFlashcardSide(flashcardSide);
    userPreferences.setSessionMode(sessionMode);
    userPreferences.setSessionLength(sessionLength);
    props.onSessionStart(sessionLength, sessionMode, flashcardSide);
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
            mode={FlashcardSide.WORD}
            selected={flashcardSide === FlashcardSide.WORD}
            onPress={() => handleFlashcardSideItemPress(FlashcardSide.WORD)}
          />
          <SessionModeItem
            mode={FlashcardSide.TRANSLATION}
            selected={flashcardSide === FlashcardSide.TRANSLATION}
            onPress={() => handleFlashcardSideItemPress(FlashcardSide.TRANSLATION)}
          />
        </View>
        <CustomText style={styles.subtitle}>{t('choose_session_mode')}</CustomText>
        <View style={styles.sessionItemsContainer}>
          <SessionModeItem
            mode={SessionMode.STUDY}
            selected={sessionMode === SessionMode.STUDY}
            onPress={() => handleSessionModeItemPress(SessionMode.STUDY)}
          />
          <SessionModeItem
            mode={SessionMode.RANDOM}
            selected={sessionMode === SessionMode.RANDOM}
            onPress={() => handleSessionModeItemPress(SessionMode.RANDOM)}
          />
          <SessionModeItem
            mode={SessionMode.OLDEST}
            selected={sessionMode === SessionMode.OLDEST}
            onPress={() => handleSessionModeItemPress(SessionMode.OLDEST)}
          />
        </View>
        <CustomText style={styles.subtitle}>{t('sessionLength')}</CustomText>
        <View style={styles.sessionItemsContainer}>
          <SessionLengthItem
            length={SessionLength.SHORT}
            selected={sessionLength === SessionLength.SHORT}
            onPress={() => handleSessionLengthItemPress(1)}
          />
          <SessionLengthItem
            length={SessionLength.MEDIUM}
            selected={sessionLength === SessionLength.MEDIUM}
            onPress={() => handleSessionLengthItemPress(2)}
          />
          <SessionLengthItem
            length={SessionLength.LONG}
            selected={sessionLength === SessionLength.LONG}
            onPress={() => handleSessionLengthItemPress(3)}
          />
        </View>
        <ActionButton
          onPress={handleActionButtonPress}
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
