import { useCallback, useRef, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

import { LanguageCode } from '../constants/Language';
import { speechLocaleMap } from '../constants/SpeechLocaleMap';
import { isIOS } from '../utils/deviceUtils';
import { useHaptics } from './useHaptics';

const IOS_SILENCE_TIMEOUT_MS = 1500;

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
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { triggerHaptics } = useHaptics();

    const onPermissionDeniedRef = useRef(init?.onPermissionDenied);
    onPermissionDeniedRef.current = init?.onPermissionDenied;

    const clearSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    }, []);

    useSpeechRecognitionEvent('start', () => {
        if (!paramsRef.current) return;
        transcriptRef.current = '';
        clearSilenceTimer();
    });

    useSpeechRecognitionEvent('end', () => {
        if (!paramsRef.current) return;
        clearSilenceTimer();
        const finalText = transcriptRef.current;
        paramsRef.current.onEnd?.(finalText);
        paramsRef.current = null;
        setActiveId(null);
    });

    useSpeechRecognitionEvent('result', event => {
        if (!paramsRef.current) return;
        const text = (event.results?.[0]?.transcript ?? '').toLowerCase();
        transcriptRef.current = text;
        paramsRef.current.onResult(text);

        if (isIOS && text) {
            clearSilenceTimer();
            silenceTimerRef.current = setTimeout(() => {
                ExpoSpeechRecognitionModule.stop();
            }, IOS_SILENCE_TIMEOUT_MS);
        }
    });

    const start = useCallback(async (params: VoiceInputParams) => {
        const { granted: wasGranted } = await ExpoSpeechRecognitionModule.getPermissionsAsync();
        const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!permission.granted) {
            onPermissionDeniedRef.current?.();
            return;
        }

        if (paramsRef.current) ExpoSpeechRecognitionModule.stop();

        paramsRef.current = params;
        transcriptRef.current = '';
        setActiveId(params.id);

        // iOS needs a moment to initialise AVAudioSession after the first permission grant.
        // Without the delay the recogniser fires an immediate `end` event and the mic turns off.
        if (!wasGranted) await new Promise<void>(resolve => setTimeout(resolve, 300));

        ExpoSpeechRecognitionModule.start({
            continuous: false,
            interimResults: true,
            lang: speechLocaleMap[params.languageCode],
        });
    }, []);

    const stop = useCallback(() => {
        if (!paramsRef.current) return;
        clearSilenceTimer();
        ExpoSpeechRecognitionModule.stop();
        paramsRef.current = null;
        setActiveId(null);
    }, [clearSilenceTimer]);

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
