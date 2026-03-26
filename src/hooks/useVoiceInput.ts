import { useCallback, useRef, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

import { LanguageCode } from '../constants/Language';
import { speechLocaleMap } from '../constants/SpeechLocaleMap';
import { useHaptics } from './useHaptics';

let activeVoiceId: string | null = null;

type UseVoiceInputParams = {
    id?: string;
    languageCode?: LanguageCode;
    onEnd?: (result: string) => void;
    onPermissionDenied?: () => void;
    onResult?: (text: string) => void;
};

export const useVoiceInput = ({
    id,
    languageCode,
    onEnd,
    onPermissionDenied,
    onResult,
}: UseVoiceInputParams) => {
    const [recording, setRecording] = useState<string | false>(false);
    const transcriptRef = useRef('');
    const { triggerHaptics } = useHaptics();

    useSpeechRecognitionEvent('start', () => {
        transcriptRef.current = '';
    });

    useSpeechRecognitionEvent('end', () => {
        if (activeVoiceId === id) {
            activeVoiceId = null;
            setRecording(false);
            onEnd?.(transcriptRef.current);
        }
    });

    useSpeechRecognitionEvent('result', event => {
        if (activeVoiceId !== id) return;

        transcriptRef.current = event.results?.[0]?.transcript ?? '';
        onResult?.(transcriptRef.current);
    });

    const start = useCallback(async () => {
        const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

        if (!permission.granted) {
            onPermissionDenied?.();
            return;
        }

        if (activeVoiceId && activeVoiceId !== id) {
            ExpoSpeechRecognitionModule.stop();
        }

        activeVoiceId = id;
        transcriptRef.current = '';
        setRecording(id);

        ExpoSpeechRecognitionModule.start({
            continuous: false,
            interimResults: true,
            lang: speechLocaleMap[languageCode],
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

        triggerHaptics('rigid');

        if (recording) {
            stop();
            return;
        }

        start();
    }, [recording, start, stop]);

    return {
        recording: activeVoiceId === id && recording,
        start,
        stop,
        toggle,
    };
};
