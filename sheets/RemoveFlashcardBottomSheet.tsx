import React, { forwardRef, useCallback } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomText from "../components/CustomText";
import { Platform, StyleSheet } from "react-native";
import ActionButton from "../components/ActionButton";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import Header from "../components/Header";
import { FullWindowOverlay } from "react-native-screens";
import FlashcardListItem from "../components/items/FlashcardListItem";
import { useWords } from "../store/WordsContext";

type AcceptationBottomSheetProps = {
  flashcardId: string;
  onRemove: () => void;
  onCancel: () => void;
  onChangeIndex?: (index: number) => void;
}

const RemoveFlashcardBottomSheet = forwardRef<BottomSheetModal, AcceptationBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const wordsContext = useWords();
  const flashcard = wordsContext.getWord(props.flashcardId);

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const renderContainerComponent = Platform.OS === "ios" ? useCallback(({ children }: any) => (
    <FullWindowOverlay>{children}</FullWindowOverlay>), []) : undefined;

  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={renderBackdrop}
      containerComponent={renderContainerComponent}
      backgroundStyle={{ backgroundColor: colors.card }}
      onChange={(index: number) => props.onChangeIndex?.(index)}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
    >
      <BottomSheetView style={styles.root}>
        <Header title={t('removingFlashcard')} subtitle={t('removingFlashcardDesc')} style={styles.header}/>
        <FlashcardListItem
          id={props.flashcardId}
          index={0}
          text={flashcard?.text}
          translation={flashcard?.translation}
          style={{ backgroundColor: colors.background }}
        />
        <ActionButton
          onPress={props.onRemove}
          label={t('continue')}
          primary={true}
          style={styles.button}
        />
        <CustomText
          style={styles.actionText}
          weight={'SemiBold'}
          onPress={props.onCancel}
        >
          {t('cancel')}
        </CustomText>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingVertical: MARGIN_VERTICAL / 2,
  },
  button: {
    marginHorizontal: MARGIN_HORIZONTAL,
    marginTop: MARGIN_VERTICAL
  },
  actionText: {
    color: colors.primary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: MARGIN_VERTICAL,
    paddingHorizontal: MARGIN_HORIZONTAL,
  },
});

export default RemoveFlashcardBottomSheet;