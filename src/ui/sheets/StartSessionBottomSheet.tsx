import React, { forwardRef, RefObject, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { SessionMode } from '../../constants/Session';
import { FlashcardSide, SessionLength } from '../../constants/UserPreferences';
import { useHaptics } from '../../hooks';
import { useUserPreferences } from '../../store';
import { ActionButton, CustomText, Header } from '../components';
import { SessionLengthItem, SessionModeItem } from '../components/session';

type StartSessionBottomSheetProps = {
    onChangeIndex?: (index: number) => void;
    onSessionStart: (
        length: SessionLength,
        mode: SessionMode,
        flashcardSide: FlashcardSide,
    ) => void;
};

export const StartSessionBottomSheet = forwardRef<BottomSheetModal, StartSessionBottomSheetProps>(
    (props, ref: RefObject<BottomSheetModal>) => {
        const { colors } = useTheme();
        const styles = getStyles(colors);
        const userPreferences = useUserPreferences();
        const [flashcardSide, setFlashcardSide] = useState<FlashcardSide>(
            userPreferences.flashcardSide,
        );
        const [sessionMode, setSessionMode] = useState<SessionMode>(userPreferences.sessionMode);
        const [sessionLength, setSessionLength] = useState<SessionLength>(
            userPreferences.sessionLength,
        );
        const { triggerHaptics } = useHaptics();
        const { t } = useTranslation();

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />
            ),
            [],
        );

        useEffect(() => {
            setFlashcardSide(userPreferences.flashcardSide);
            setSessionMode(userPreferences.sessionMode);
            setSessionLength(userPreferences.sessionLength);
        }, [
            userPreferences.flashcardSide,
            userPreferences.sessionMode,
            userPreferences.sessionLength,
        ]);

        const handleFlashcardSideItemPress = (flashcardSide: FlashcardSide) => {
            triggerHaptics('soft');
            setFlashcardSide(flashcardSide);
        };

        const handleSessionModeItemPress = (mode: SessionMode) => {
            triggerHaptics('soft');
            setSessionMode(mode);
        };

        const handleSessionLengthItemPress = (length: SessionLength) => {
            triggerHaptics('soft');
            setSessionLength(length);
        };

        const handleActionButtonPress = async () => {
            userPreferences.setFlashcardSide(flashcardSide);
            userPreferences.setSessionMode(sessionMode);
            userPreferences.setSessionLength(sessionLength);
            props.onSessionStart(sessionLength, sessionMode, flashcardSide);
        };

        return (
            <BottomSheetModal
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.bottomSheetModal}
                handleIndicatorStyle={styles.handleIndicatorStyle}
                index={0}
                ref={ref}
                onChange={(index: number) => props.onChangeIndex?.(index)}
            >
                <BottomSheetScrollView style={styles.root}>
                    <Header style={styles.header} title={t('startSession')} />
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
                    <CustomText style={styles.subtitle}>{t('choose_session_mode')}</CustomText>
                    <View style={styles.sessionItemsContainer}>
                        <SessionModeItem
                            mode={SessionMode.STUDY}
                            selected={sessionMode === SessionMode.STUDY}
                            onPress={() => handleSessionModeItemPress(SessionMode.STUDY)}
                        />
                        <SessionModeItem
                            mode={SessionMode.RANDOM}
                            selected={sessionMode === SessionMode.RANDOM}
                            onPress={() => handleSessionModeItemPress(SessionMode.RANDOM)}
                        />
                        <SessionModeItem
                            mode={SessionMode.OLDEST}
                            selected={sessionMode === SessionMode.OLDEST}
                            onPress={() => handleSessionModeItemPress(SessionMode.OLDEST)}
                        />
                    </View>
                    <CustomText style={styles.subtitle}>{t('sessionLength')}</CustomText>
                    <View style={styles.sessionItemsContainer}>
                        <SessionLengthItem
                            length={SessionLength.SHORT}
                            selected={sessionLength === SessionLength.SHORT}
                            onPress={() => handleSessionLengthItemPress(1)}
                        />
                        <SessionLengthItem
                            length={SessionLength.MEDIUM}
                            selected={sessionLength === SessionLength.MEDIUM}
                            onPress={() => handleSessionLengthItemPress(2)}
                        />
                        <SessionLengthItem
                            length={SessionLength.LONG}
                            selected={sessionLength === SessionLength.LONG}
                            onPress={() => handleSessionLengthItemPress(3)}
                        />
                    </View>
                    <ActionButton
                        icon={'play-sharp'}
                        label={t('startSession')}
                        primary={true}
                        style={styles.button}
                        onPress={handleActionButtonPress}
                    />
                </BottomSheetScrollView>
            </BottomSheetModal>
        );
    },
);

const getStyles = (colors: any) =>
    StyleSheet.create({
        bottomSheetModal: {
            backgroundColor: colors.card,
        },
        button: {
            marginVertical: MARGIN_VERTICAL,
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
