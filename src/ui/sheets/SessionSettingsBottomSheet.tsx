import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { BOTTOM_SHEET_GRABBER_OPTIONS } from '../../constants/Common';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { FlashcardSide } from '../../constants/UserPreferences';
import { useHaptics } from '../../hooks';
import { useLanguage, useUserPreferences } from '../../store';
import { ActionButton, CustomText, Header } from '../components';
import { SessionModeItem } from '../components/session/SessionModeItem';
import { SessionSpeechSynthesizerItem } from '../components/session/SessionSpeechSynthesizerItem';
import { CustomTheme } from '../Theme';

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

    const handleDidDismiss = () => {
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

    return (
        <TrueSheet
            backgroundColor={colors.card}
            detents={['auto']}
            grabberOptions={BOTTOM_SHEET_GRABBER_OPTIONS}
            name={props.sheetName}
            onDidDismiss={handleDidDismiss}
        >
            <View style={styles.root}>
                <Header style={styles.header} title={t('sessions_settings')} />
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
                <ActionButton
                    icon={'save-sharp'}
                    label={t('save')}
                    primary={true}
                    style={styles.button}
                    onPress={handleActionButtonPress}
                />
                <CustomText
                    style={styles.actionText}
                    weight={'SemiBold'}
                    onPress={() => TrueSheet.dismiss(props.sheetName)}
                >
                    {t('cancel')}
                </CustomText>
            </View>
        </TrueSheet>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        actionText: {
            color: colors.primary,
            fontSize: 13,
            paddingVertical: MARGIN_VERTICAL,
            textAlign: 'center',
        },
        button: {
            marginTop: MARGIN_VERTICAL,
        },
        header: {
            paddingTop: MARGIN_VERTICAL / 2,
        },
        root: {
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: MARGIN_VERTICAL,
        },
        sessionItemsContainer: {
            flexDirection: 'row',
            gap: 6,
            marginTop: 5,
        },
        subtitle: {
            color: colors.primary600,
            fontSize: 14,
            paddingBottom: 3,
            paddingTop: 15,
        },
    });
