import React, {
  forwardRef,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import FlipCard from "react-native-flip-card";
import { Card } from "../components/session";
import { StyleSheet } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import { GenericBottomSheet } from "./GenericBottomSheet";

type HitFlashcardBottomSheetProps = {
  onChangeIndex?: (index: number) => void;
};

export const HitFlashcardBottomSheet = forwardRef<
  BottomSheetModal,
  HitFlashcardBottomSheetProps
>((props, ref: RefObject<BottomSheetModal>) => {
  const { t } = useTranslation();
  const styles = getStyles();
  const [flip, setFlip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setFlip((f) => !f), 2000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [flip, isVisible]);

  const onFlipStart = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setFlip((f) => !f), 2000);
  };

  const handleChangeIndex = (index?: number) => {
    setIsVisible(index !== undefined && index >= 0);
    if (props.onChangeIndex) props.onChangeIndex(index);
  };

  return (
    <GenericBottomSheet
      ref={ref}
      title={t("hit_flashcard_bottom_sheet.title")}
      description={t("hit_flashcard_bottom_sheet.desc")}
      primaryActionLabel={t("hit_flashcard_bottom_sheet.got_it")}
      onPrimaryButtonPress={() =>
        ref && typeof ref !== "function" && ref.current?.dismiss()
      }
      onChangeIndex={handleChangeIndex}
    >
      <FlipCard
        style={styles.exampleCard}
        onFlipStart={onFlipStart}
        flipVertical={false}
        flip={flip}
        flipHorizontal
        alignHeight
        alignWidth
      >
        <Card text={t("hit_flashcard_bottom_sheet.word")} />
        <Card text={t("hit_flashcard_bottom_sheet.translation")} />
      </FlipCard>
    </GenericBottomSheet>
  );
});

const getStyles = () =>
  StyleSheet.create({
    exampleCard: {
      height: 350,
      alignSelf: "center",
      marginTop: MARGIN_VERTICAL,
      marginHorizontal: MARGIN_HORIZONTAL,
    },
  });
