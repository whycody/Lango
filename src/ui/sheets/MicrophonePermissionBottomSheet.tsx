import React, { ForwardedRef, forwardRef, useEffect } from 'react';
import { AppState } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { useTranslation } from 'react-i18next';

import { ensureMicrophonePermission } from '../../utils/ensureMicrophonePermission';
import { GenericBottomSheet } from './GenericBottomSheet';

type MicrophonePermissionBottomSheetProps = {
    onChangeIndex?: (index: number) => void;
};

export const MicrophonePermissionBottomSheet = forwardRef<
    BottomSheetModal,
    MicrophonePermissionBottomSheetProps
>((props, ref: ForwardedRef<BottomSheetModal>) => {
    const { t } = useTranslation();

    useEffect(() => {
        const subscription = AppState.addEventListener('change', async state => {
            if (state === 'active') {
                const { status } = await ExpoSpeechRecognitionModule.getPermissionsAsync();

                if (status === 'granted') {
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
        ref && typeof ref !== 'function' && ref.current?.dismiss();
    };

    const handlePrimaryButtonPress = async () => {
        const permission = await ensureMicrophonePermission();
        if (!permission) return;
        dismiss();
    };

    return (
        <GenericBottomSheet
            description={t('microphone.desc')}
            primaryActionLabel={t('general.open_settings')}
            ref={ref}
            secondaryActionLabel={t('general.cancel')}
            title={t('microphone.no_permission')}
            onChangeIndex={handleChangeIndex}
            onPrimaryButtonPress={handlePrimaryButtonPress}
            onSecondaryButtonPress={dismiss}
        />
    );
});
