import { useCallback, useRef, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

import { LanguageCode } from '../constants/Language';
import { speechLocaleMap } from '../constants/SpeechLocaleMap';
import { useHaptics } from './useHaptics';

export type VoiceInputParams = {
    id: string;
    languageCode: LanguageCode;
    onEnd?: (result: string) => void;
    onResult: (text: string) => void;
};

type VoiceInputInit = {
    onPermissionDenied?: () => void;
};

export const useVoiceInput = (init?: VoiceInputInit) => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const paramsRef = useRef<VoiceInputParams | null>(null);
    const transcriptRef = useRef('');
    const { triggerHaptics } = useHaptics();

    const onPermissionDeniedRef = useRef(init?.onPermissionDenied);
    onPermissionDeniedRef.current = init?.onPermissionDenied;

    useSpeechRecognitionEvent('start', () => {
        transcriptRef.current = '';
    });

    useSpeechRecognitionEvent('end', () => {
        const finalText = transcriptRef.current;
        paramsRef.current?.onEnd?.(finalText);
        paramsRef.current = null;
        setActiveId(null);
    });

    useSpeechRecognitionEvent('result', event => {
        const text = event.results?.[0]?.transcript ?? '';
        transcriptRef.current = text;
        paramsRef.current?.onResult(text);
    });

    const start = useCallback(async (params: VoiceInputParams) => {
        const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!permission.granted) {
            onPermissionDeniedRef.current?.();
            return;
        }

        if (paramsRef.current) ExpoSpeechRecognitionModule.stop();

        paramsRef.current = params;
        transcriptRef.current = '';
        setActiveId(params.id);

        ExpoSpeechRecognitionModule.start({
            continuous: false,
            interimResults: true,
            lang: speechLocaleMap[params.languageCode],
        });
    }, []);

    const stop = useCallback(() => {
        if (!paramsRef.current) return;
        ExpoSpeechRecognitionModule.stop();
        paramsRef.current = null;
        setActiveId(null);
    }, []);

    const toggle = useCallback(
        (params: VoiceInputParams) => {
            if (activeId && activeId !== params.id) return;
            triggerHaptics('rigid');
            if (activeId === params.id) {
                stop();
                return;
            }
            start(params);
        },
        [activeId, start, stop, triggerHaptics],
    );

    return {
        activeId,
        isRecording: (id: string) => activeId === id,
        recording: activeId !== null,
        start,
        stop,
        toggle,
    };
};
