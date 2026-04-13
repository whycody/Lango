import React, { useEffect } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { useTranslation } from 'react-i18next';

import { BOTTOM_SHEET_GRABBER_OPTIONS } from '../../constants/Common';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { ensureMicrophonePermission } from '../../utils/ensureMicrophonePermission';
import { ActionButton, Header } from '../components';
import { CustomTheme } from '../Theme';

type MicrophonePermissionBottomSheetProps = {
    sheetName: string;
};

export const MicrophonePermissionBottomSheet = (props: MicrophonePermissionBottomSheetProps) => {
    const { sheetName } = props;
    const { t } = useTranslation();
    const { colors } = useTheme() as CustomTheme;

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
        <TrueSheet
            backgroundColor={colors.card}
            cornerRadius={24}
            detents={['auto']}
            dimmed={true}
            grabberOptions={BOTTOM_SHEET_GRABBER_OPTIONS}
            name={sheetName}
        >
            <View style={styles.root}>
                <Header
                    style={styles.headerMargin}
                    subtitle={t('microphone.desc')}
                    title={t('microphone.no_permission')}
                />
                <ActionButton
                    label={t('general.open_settings')}
                    primary={true}
                    style={styles.button}
                    onPress={handlePrimaryButtonPress}
                />
                <ActionButton
                    label={t('general.cancel')}
                    primary={false}
                    style={styles.button}
                    onPress={handleSecondaryButtonPress}
                />
            </View>
        </TrueSheet>
    );
};

const styles = StyleSheet.create({
    button: {
        marginTop: MARGIN_VERTICAL / 2,
    },
    headerMargin: {
        marginVertical: 10,
    },
    root: {
        paddingHorizontal: MARGIN_HORIZONTAL,
        paddingVertical: MARGIN_VERTICAL,
    },
});
