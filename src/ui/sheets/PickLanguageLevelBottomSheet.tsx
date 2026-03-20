import React, { forwardRef } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { GenericBottomSheet } from "./GenericBottomSheet";
import { Language } from "../../types";
import { LanguageLevelPicker } from "../components/LanguageLevelPicker";
import { useLanguage } from "../../store";

export const PickLanguageLevelBottomSheet = forwardRef<
  BottomSheetModal,
  {
    language?: Language;
    onChangeIndex?: (index: number) => void;
  }
>((props, ref) => {
  const { t } = useTranslation();
  const { mainLang } = useLanguage();

  const handleChangeIndex = (index?: number) => {
    if (props.onChangeIndex) props.onChangeIndex(index);
  };

  const dismiss = () => {
    ref && typeof ref !== "function" && ref.current?.dismiss();
  };

  // Do not allow dismissing when user doesn't have information about language level
  // and has already picked it in previous version of app
  const allowDismiss = mainLang !== props.language?.languageCode;

  return (
    <GenericBottomSheet
      ref={ref}
      allowDismiss={allowDismiss}
      primaryActionLabel={t("general.cancel")}
      onPrimaryButtonPress={dismiss}
      primaryButtonEnabled={allowDismiss}
      onChangeIndex={handleChangeIndex}
    >
      <LanguageLevelPicker language={props.language} onLevelPick={dismiss} />
    </GenericBottomSheet>
  );
});
