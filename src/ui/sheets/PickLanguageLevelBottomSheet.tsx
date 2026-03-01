import React, { forwardRef } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { GenericBottomSheet } from "./GenericBottomSheet";
import { Language } from "../../types";
import { LanguageLevelPicker } from "../components/LanguageLevelPicker";

export const PickLanguageLevelBottomSheet = forwardRef<BottomSheetModal, {
  language?: Language,
  onChangeIndex?: (index: number) => void
}>((props, ref) => {
  const { t } = useTranslation();

  const handleChangeIndex = (index?: number) => {
    if (props.onChangeIndex) props.onChangeIndex(index);
  };

  const dismiss = () => {
    ref && typeof ref !== 'function' && ref.current?.dismiss();
  }

  return (
    <GenericBottomSheet
      ref={ref}
      primaryActionLabel={t('general.cancel')}
      onPrimaryButtonPress={dismiss}
      onChangeIndex={handleChangeIndex}
    >
      <LanguageLevelPicker language={props.language} onLevelPick={dismiss} />
    </GenericBottomSheet>
  );
});
