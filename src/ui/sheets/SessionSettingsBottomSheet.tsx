import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import ActionButton from "../components/ActionButton";
import * as Haptics from "expo-haptics";
import Header from "../components/Header";
import CustomText from "../components/CustomText";
import SessionModeItem from "../components/items/SessionModeItem";
import { FlashcardSide, useUserPreferences } from "../../store/UserPreferencesContext";
import { useTranslation } from "react-i18next";
import SessionSpeechSynthesizerItem from "../components/items/SessionSpeechSynthesizerItem";
import { useHaptics } from "../../hooks/useHaptics";

interface StartSessionBottomSheetProps {
  onSettingsSave: () => void,
  onChangeIndex?: (index: number) => void;
}

const SessionSettingsBottomSheet = forwardRef<BottomSheetModal, StartSessionBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const userPreferences = useUserPreferences();
  const [flashcardSide, setFlashcardSide] = useState<FlashcardSide>(userPreferences.flashcardSide);
  const [sessionSpeechSynthesizer, setSessionSpeechSynthesizer] = useState<boolean>(userPreferences.sessionSpeechSynthesizer);
  const { t } = useTranslation();
  const { triggerHaptics } = useHaptics();
  const saved = useRef(false);

  useEffect(() => {
    setFlashcardSide(userPreferences.flashcardSide);
    setSessionSpeechSynthesizer(userPreferences.sessionSpeechSynthesizer);
  }, [userPreferences.flashcardSide, userPreferences.sessionSpeechSynthesizer]);

  const handleChangingIndex = (index: number) => {
    if (index == -1) {
      if (!saved.current) {
        setFlashcardSide(userPreferences.flashcardSide);
        setSessionSpeechSynthesizer(userPreferences.sessionSpeechSynthesizer);
      }
      saved.current = false;
    }

    props.onChangeIndex?.(index);
  }

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const handleFlashcardSideItemPress = (flashcardSide: FlashcardSide) => {
    triggerHaptics(Haptics.ImpactFeedbackStyle.Soft);
    setFlashcardSide(flashcardSide);
  }

  const handleSessionSpeechSynthesizerItemPress = (sessionSpeechSynthesizer: boolean) => {
    triggerHaptics(Haptics.ImpactFeedbackStyle.Soft);
    setSessionSpeechSynthesizer(sessionSpeechSynthesizer);
  }

  const handleActionButtonPress = async () => {
    saved.current = true;
    userPreferences.setFlashcardSide(flashcardSide);
    userPreferences.setSessionSpeechSynthesizer(sessionSpeechSynthesizer);
    props.onSettingsSave();
  }

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      onChange={handleChangingIndex}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
    >
      <BottomSheetScrollView style={styles.root}>
        <Header title={t('sessions_settings')} style={styles.header}/>
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
        <CustomText style={styles.subtitle}>{t('speech_synthesizer')}</CustomText>
        <View style={styles.sessionItemsContainer}>
          <SessionSpeechSynthesizerItem
            synthesizerOn={true}
            selected={sessionSpeechSynthesizer}
            onPress={() => handleSessionSpeechSynthesizerItemPress(true)}
          />
          <SessionSpeechSynthesizerItem
            synthesizerOn={false}
            selected={!sessionSpeechSynthesizer}
            onPress={() => handleSessionSpeechSynthesizerItemPress(false)}
          />
        </View>
        <ActionButton
          onPress={handleActionButtonPress}
          label={t('save')}
          primary={true}
          style={styles.button}
          icon={'save-sharp'}
        />
        <CustomText
          style={styles.actionText}
          weight={'SemiBold'}
          onPress={props.onSettingsSave}
        >
          {t('cancel')}
        </CustomText>
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
    marginTop: MARGIN_VERTICAL
  },
  actionText: {
    color: colors.primary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: MARGIN_VERTICAL
  },
});

export default SessionSettingsBottomSheet;