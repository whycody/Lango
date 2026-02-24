import { alertOpenSettings } from "./alertOpenSettings";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";

export const ensureMicrophonePermission = async (): Promise<boolean> => {
  let { status, canAskAgain } = await ExpoSpeechRecognitionModule.getPermissionsAsync();

  if (status !== "granted" && canAskAgain) {
    const req = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    status = req.status;
    canAskAgain = req.canAskAgain;
  }

  if (status !== "granted" && !canAskAgain) {
    alertOpenSettings('microphone');
    return false;
  }

  return status === "granted";
};