import { useCallback, useRef, useState } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { speechLocaleMap } from "../constants/SpeechLocaleMap";

let activeVoiceId: string | null = null;

type UseVoiceInputParams = {
  id?: string;
  languageCode?: string;
  onResult?: (text: string) => void;
  onPermissionDenied?: () => void;
};

export const useVoiceInput = ({ id, languageCode, onResult, onPermissionDenied, }: UseVoiceInputParams) => {
  const [recording, setRecording] = useState(false);
  const transcriptRef = useRef("");

  useSpeechRecognitionEvent("start", () => {
    transcriptRef.current = "";
  });

  useSpeechRecognitionEvent("end", () => {
    if (activeVoiceId === id) {
      activeVoiceId = null;
      setRecording(false);
    }
  });

  useSpeechRecognitionEvent("result", (event) => {
    if (activeVoiceId !== id) return;

    const text = event.results?.[0]?.transcript ?? "";
    transcriptRef.current += text;
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
    setRecording(true);

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
    if (recording) {
      stop();
    } else {
      start();
    }
  }, [recording, start, stop]);

  return {
    recording: activeVoiceId === id && recording,
    toggle,
    start,
    stop,
  };
};