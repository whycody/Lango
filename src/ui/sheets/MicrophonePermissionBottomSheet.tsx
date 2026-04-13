import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { useTranslation } from 'react-i18next';

import { ensureMicrophonePermission } from '../../utils/ensureMicrophonePermission';
import { GenericBottomSheet } from './GenericBottomSheet';

type MicrophonePermissionBottomSheetProps = {
    sheetName: string;
};

export const MicrophonePermissionBottomSheet = (props: MicrophonePermissionBottomSheetProps) => {
    const { sheetName } = props;
    const { t } = useTranslation();

    useEffect(() => {
        const subscription = AppState.addEventListener('change', async state => {
            if (state !== 'active') return;
            const { status } = await ExpoSpeechRecognitionModule.getPermissionsAsync();
            if (status !== 'granted') return;
            TrueSheet.dismiss(sheetName);
        });

        return () => {
            subscription.remove();
        };
    }, [sheetName]);

    const handlePrimaryButtonPress = async () => {
        const permission = await ensureMicrophonePermission();
        if (!permission) return;
        TrueSheet.dismiss(sheetName);
    };

    const handleSecondaryButtonPress = () => {
        TrueSheet.dismiss(sheetName);
    };

    return (
        <GenericBottomSheet
            description={t('microphone.desc')}
            primaryActionLabel={t('general.open_settings')}
            secondaryActionLabel={t('general.cancel')}
            sheetName={sheetName}
            title={t('microphone.no_permission')}
            onPrimaryButtonPress={handlePrimaryButtonPress}
            onSecondaryButtonPress={handleSecondaryButtonPress}
        />
    );
};
