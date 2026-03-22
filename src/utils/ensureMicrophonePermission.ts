import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

import { alertOpenSettings } from './alertOpenSettings';

export const ensureMicrophonePermission = async (): Promise<boolean> => {
    let { canAskAgain, status } = await ExpoSpeechRecognitionModule.getPermissionsAsync();

    if (status !== 'granted' && canAskAgain) {
        const req = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        status = req.status;
        canAskAgain = req.canAskAgain;
    }

    if (status !== 'granted' && !canAskAgain) {
        alertOpenSettings('microphone');
        return false;
    }

    return status === 'granted';
};
