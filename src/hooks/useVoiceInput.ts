import { useCallback, useRef, useState } from "react";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent, } from "expo-speech-recognition";
import { speechLocaleMap } from "../constants/SpeechLocaleMap";
import { useHaptics } from "./useHaptics";
import { ImpactFeedbackStyle } from "expo-haptics";

let activeVoiceId: string | null = null;

type UseVoiceInputParams = {
  id?: string;
  languageCode?: string;
  onResult?: (text: string) => void;
  onPermissionDenied?: () => void;
  onEnd?: (result: string) => void;
};

export const useVoiceInput = ({ id, languageCode, onResult, onPermissionDenied, onEnd }: UseVoiceInputParams) => {
  const [recording, setRecording] = useState<string | false>(false);
  const transcriptRef = useRef("");
  const haptics = useHaptics();

  useSpeechRecognitionEvent("start", () => {
    transcriptRef.current = "";
  });

  useSpeechRecognitionEvent("end", () => {
    if (activeVoiceId === id) {
      activeVoiceId = null;
      setRecording(false);
      onEnd?.(transcriptRef.current);
    }
  });

  useSpeechRecognitionEvent("result", (event) => {
    if (activeVoiceId !== id) return;

    transcriptRef.current = event.results?.[0]?.transcript ?? "";
    onResult?.(transcriptRef.current);
  });

  const start = useCallback(async () => {
    const permission =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!permission.granted) {
      onPermissionDenied?.();
      return;
    }

    if (activeVoiceId && activeVoiceId !== id) {
      ExpoSpeechRecognitionModule.stop();
    }

    activeVoiceId = id;
    transcriptRef.current = "";
    setRecording(id);

    ExpoSpeechRecognitionModule.start({
      lang: speechLocaleMap[languageCode],
      interimResults: true,
      continuous: false,
    });
  }, [id, languageCode, onPermissionDenied]);

  const stop = useCallback(() => {
    if (activeVoiceId === id) {
      ExpoSpeechRecognitionModule.stop();
      activeVoiceId = null;
      setRecording(false);
    }
  }, [id]);

  const toggle = useCallback(() => {
    if (activeVoiceId && activeVoiceId !== id) {
      return;
    }

    haptics.triggerHaptics(ImpactFeedbackStyle.Rigid);

    if (recording) {
      stop();
      return;
    }

    start();
  }, [recording, start, stop]);

  return {
    recording: activeVoiceId === id && recording,
    toggle,
    start,
    stop,
  };
};