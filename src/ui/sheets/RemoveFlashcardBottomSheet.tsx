import React, { forwardRef, RefObject, useCallback } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { ActionButton, CustomText, Header } from "../components";
import { FlashcardListItem } from "../components/items";
import { Platform, StyleSheet } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import { FullWindowOverlay } from "react-native-screens";
import { useWordsWithDetails } from "../../store";

type RemoveFlashcardBottomSheetProps = {
  flashcardId: string;
  onRemove: () => void;
  onCancel: () => void;
  onChangeIndex?: (index: number) => void;
};

export const RemoveFlashcardBottomSheet = forwardRef<
  BottomSheetModal,
  RemoveFlashcardBottomSheetProps
>((props, ref: RefObject<BottomSheetModal>) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const wordsWithDetailsContext = useWordsWithDetails();

  const flashcard = wordsWithDetailsContext.wordsWithDetails.find(
    (word) => word.id === props.flashcardId,
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    [],
  );

  const renderContainerComponent =
    Platform.OS === "ios"
      ? useCallback(
          ({ children }: any) => (
            <FullWindowOverlay>{children}</FullWindowOverlay>
          ),
          [],
        )
      : undefined;

  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={renderBackdrop}
      containerComponent={renderContainerComponent}
      backgroundStyle={styles.bottomSheetModal}
      onChange={(index: number) => props.onChangeIndex?.(index)}
      handleIndicatorStyle={styles.handleIndicatorStyle}
    >
      <BottomSheetView style={styles.root}>
        <Header
          title={t("removingFlashcard")}
          subtitle={t("removingFlashcardDesc")}
          style={styles.header}
        />
        <FlashcardListItem
          id={props.flashcardId}
          level={flashcard?.gradeThreeProb ?? 0}
          text={flashcard?.text}
          translation={flashcard?.translation}
          style={styles.item}
        />
        <ActionButton
          onPress={props.onRemove}
          label={t("continue")}
          primary={true}
          style={styles.button}
        />
        <CustomText
          style={styles.actionText}
          weight={"SemiBold"}
          onPress={props.onCancel}
        >
          {t("cancel")}
        </CustomText>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const getStyles = (colors: any) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    item: {
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: MARGIN_HORIZONTAL,
      paddingVertical: MARGIN_VERTICAL / 2,
    },
    button: {
      marginHorizontal: MARGIN_HORIZONTAL,
      marginTop: MARGIN_VERTICAL,
    },
    actionText: {
      color: colors.primary,
      fontSize: 13,
      textAlign: "center",
      paddingVertical: MARGIN_VERTICAL,
      paddingHorizontal: MARGIN_HORIZONTAL,
    },
    bottomSheetModal: {
      backgroundColor: colors.card,
    },
    handleIndicatorStyle: {
      backgroundColor: colors.primary,
      borderRadius: 0,
    },
  });
