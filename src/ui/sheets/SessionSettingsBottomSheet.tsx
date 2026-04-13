import React, { ForwardedRef, forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { FlashcardSide } from '../../constants/UserPreferences';
import { useHaptics } from '../../hooks';
import { useLanguage, useUserPreferences } from '../../store';
import { ActionButton, CustomText, Header } from '../components';
import { SessionModeItem, SessionSpeechSynthesizerItem } from '../components/session';
import { CustomTheme } from '../Theme';

type SessionSettingsBottomSheetProps = {
    onChangeIndex?: (index: number) => void;
    onSettingsSave: () => void;
};

export const SessionSettingsBottomSheet = forwardRef<
    BottomSheetModal,
    SessionSettingsBottomSheetProps
>((props, ref: ForwardedRef<BottomSheetModal>) => {
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

    const handleChangingIndex = (index: number) => {
        if (index == -1) {
            if (!saved.current) {
                setFlashcardSide(userPreferences.flashcardSide);
                setSessionSpeechSynthesizer(userPreferences.sessionSpeechSynthesizer);
            }
            saved.current = false;
        }

        props.onChangeIndex?.(index);
    };

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />
        ),
        [],
    );

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
        props.onSettingsSave();
    };

    return (
        <BottomSheetModal
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.bottomSheetModal}
            handleIndicatorStyle={styles.handleIndicatorStyle}
            index={0}
            ref={ref}
            onChange={handleChangingIndex}
        >
            <BottomSheetScrollView style={styles.root}>
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
                    onPress={props.onSettingsSave}
                >
                    {t('cancel')}
                </CustomText>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
});

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        actionText: {
            color: colors.primary,
            fontSize: 13,
            paddingVertical: MARGIN_VERTICAL,
            textAlign: 'center',
        },
        bottomSheetModal: {
            backgroundColor: colors.card,
        },
        button: {
            marginTop: MARGIN_VERTICAL,
        },
        handleIndicatorStyle: {
            backgroundColor: colors.primary,
            borderRadius: 0,
        },
        header: {
            paddingTop: MARGIN_VERTICAL / 2,
        },
        root: {
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        sessionItemsContainer: {
            flex: 1,
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
