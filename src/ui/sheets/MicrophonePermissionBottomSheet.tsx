import React, { forwardRef, RefObject, useEffect } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { GenericBottomSheet } from "./GenericBottomSheet";
import { ensureMicrophonePermission } from "../../utils/ensureMicrophonePermission";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import { AppState } from "react-native";

type MicrophonePermissionBottomSheetProps = {
  onChangeIndex?: (index: number) => void;
};

export const MicrophonePermissionBottomSheet = forwardRef<
  BottomSheetModal,
  MicrophonePermissionBottomSheetProps
>((props, ref: RefObject<BottomSheetModal>) => {
  const { t } = useTranslation();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        const { status } =
          await ExpoSpeechRecognitionModule.getPermissionsAsync();

        if (status === "granted") {
          dismiss();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleChangeIndex = (index?: number) => {
    if (props.onChangeIndex) props.onChangeIndex(index);
  };

  const dismiss = () => {
    ref && typeof ref !== "function" && ref.current?.dismiss();
  };

  const handlePrimaryButtonPress = async () => {
    const permission = await ensureMicrophonePermission();
    if (!permission) return;
    dismiss();
  };

  return (
    <GenericBottomSheet
      ref={ref}
      title={t("microphone.no_permission")}
      description={t("microphone.desc")}
      primaryActionLabel={t("general.open_settings")}
      secondaryActionLabel={t("general.cancel")}
      onPrimaryButtonPress={handlePrimaryButtonPress}
      onSecondaryButtonPress={dismiss}
      onChangeIndex={handleChangeIndex}
    />
  );
});
