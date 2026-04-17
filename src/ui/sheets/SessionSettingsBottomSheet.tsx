import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { FlashcardSide } from '../../constants/UserPreferences';
import { useHaptics } from '../../hooks';
import { useLanguage, useUserPreferences } from '../../store';
import { CustomText } from '../components';
import { SessionModeItem } from '../components/session/SessionModeItem';
import { SessionSpeechSynthesizerItem } from '../components/session/SessionSpeechSynthesizerItem';
import { CustomTheme } from '../Theme';
import { GenericBottomSheet } from './GenericBottomSheet';

type SessionSettingsBottomSheetProps = {
    sheetName: string;
};

export const SessionSettingsBottomSheet = (props: SessionSettingsBottomSheetProps) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);
    const userPreferences = useUserPreferences();
    const [flashcardSide, setFlashcardSide] = useState<FlashcardSide>(
        userPreferences.flashcardSide,
    );
    const [sessionSpeechSynthesizer, setSessionSpeechSynthesizer] = useState<boolean>(
        userPreferences.sessionSpeechSynthesizer,
    );
    const { t } = useTranslation();
    const { triggerHaptics } = useHaptics();
    const { mainLang, translationLang } = useLanguage();
    const saved = useRef(false);

    useEffect(() => {
        setFlashcardSide(userPreferences.flashcardSide);
        setSessionSpeechSynthesizer(userPreferences.sessionSpeechSynthesizer);
    }, [userPreferences.flashcardSide, userPreferences.sessionSpeechSynthesizer]);

    const handleDismiss = () => {
        if (!saved.current) {
            setFlashcardSide(userPreferences.flashcardSide);
            setSessionSpeechSynthesizer(userPreferences.sessionSpeechSynthesizer);
        }
        saved.current = false;
    };

    const handleFlashcardSideItemPress = (flashcardSide: FlashcardSide) => {
        triggerHaptics('soft');
        setFlashcardSide(flashcardSide);
    };

    const handleSessionSpeechSynthesizerItemPress = (sessionSpeechSynthesizer: boolean) => {
        triggerHaptics('soft');
        setSessionSpeechSynthesizer(sessionSpeechSynthesizer);
    };

    const handleActionButtonPress = async () => {
        saved.current = true;
        userPreferences.setFlashcardSide(flashcardSide);
        userPreferences.setSessionSpeechSynthesizer(sessionSpeechSynthesizer);
        TrueSheet.dismiss(props.sheetName);
    };

    const handleSecondaryActionButtonPress = () => {
        TrueSheet.dismiss(props.sheetName);
    };

    return (
        <GenericBottomSheet
            primaryActionIcon={'save-sharp'}
            primaryActionLabel={t('save')}
            primaryButtonEnabled={true}
            secondaryActionLabel={t('cancel')}
            sheetName={props.sheetName}
            title={t('sessions_settings')}
            onDidDismiss={handleDismiss}
            onPrimaryButtonPress={handleActionButtonPress}
            onSecondaryButtonPress={handleSecondaryActionButtonPress}
        >
            <CustomText style={styles.subtitle}>{t('choose_flashcard_side')}</CustomText>
            <View style={styles.sessionItemsContainer}>
                <SessionModeItem
                    mode={FlashcardSide.WORD}
                    selected={flashcardSide === FlashcardSide.WORD}
                    onPress={() => handleFlashcardSideItemPress(FlashcardSide.WORD)}
                />
                <SessionModeItem
                    mode={FlashcardSide.TRANSLATION}
                    selected={flashcardSide === FlashcardSide.TRANSLATION}
                    onPress={() => handleFlashcardSideItemPress(FlashcardSide.TRANSLATION)}
                />
            </View>

            {mainLang !== translationLang && (
                <>
                    <CustomText style={styles.subtitle}>{t('speech_synthesizer')}</CustomText>
                    <View style={styles.sessionItemsContainer}>
                        <SessionSpeechSynthesizerItem
                            selected={sessionSpeechSynthesizer}
                            synthesizerOn={true}
                            onPress={() => handleSessionSpeechSynthesizerItemPress(true)}
                        />
                        <SessionSpeechSynthesizerItem
                            selected={!sessionSpeechSynthesizer}
                            synthesizerOn={false}
                            onPress={() => handleSessionSpeechSynthesizerItemPress(false)}
                        />
                    </View>
                </>
            )}
        </GenericBottomSheet>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        header: {
            paddingTop: MARGIN_VERTICAL / 2,
        },
        sessionItemsContainer: {
            flexDirection: 'row',
            gap: 6,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 5,
        },
        subtitle: {
            color: colors.primary600,
            fontSize: 14,
            marginHorizontal: MARGIN_HORIZONTAL,
            paddingBottom: 3,
            paddingTop: 15,
        },
    });
