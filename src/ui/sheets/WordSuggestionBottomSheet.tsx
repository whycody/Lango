import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { useUserPreferences } from '../../store';
import { Card, FlipCard } from '../components/session';
import { GenericBottomSheet } from './GenericBottomSheet';

type WordSuggestionBottomSheetProps = {
    sheetName: string;
};

export const WordSuggestionBottomSheet = (props: WordSuggestionBottomSheetProps) => {
    const { t } = useTranslation();
    const styles = getStyles();
    const [flip, setFlip] = useState(false);
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { setUserHasEverSeenSuggestionInSession } = useUserPreferences();

    const clearFlipTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    useEffect(() => clearFlipTimeout, []);

    useEffect(() => {
        clearFlipTimeout();
        if (!visible) return;
        timeoutRef.current = setTimeout(() => setFlip(f => !f), 4000);
        return clearFlipTimeout;
    }, [flip, visible]);

    const onFlipStart = () => {
        clearFlipTimeout();
        timeoutRef.current = setTimeout(() => setFlip(f => !f), 4000);
    };

    const handlePrimaryButtonPress = () => {
        TrueSheet.dismiss(props.sheetName);
        setUserHasEverSeenSuggestionInSession(true);
    };

    const suggestionWord = {
        type: 'suggestion',
    } as any;

    return (
        <GenericBottomSheet
            description={t('word_suggestion_bottom_sheet.desc')}
            primaryActionLabel={t('common.got_it')}
            sheetName={props.sheetName}
            title={t('word_suggestion_bottom_sheet.title')}
            onDidDismiss={() => setVisible(false)}
            onDidPresent={() => setVisible(true)}
            onPrimaryButtonPress={handlePrimaryButtonPress}
        >
            <FlipCard
                flipHorizontal
                flip={flip}
                flipVertical={false}
                style={styles.exampleCard}
                onFlipStart={onFlipStart}
            >
                <Card
                    text={t('word_suggestion_bottom_sheet.word')}
                    textStyle={styles.cardText}
                    userHasEverSkippedSuggestion={false}
                    word={suggestionWord}
                    onContinuePress={() => {}}
                />
                <Card
                    text={t('word_suggestion_bottom_sheet.translation')}
                    textStyle={styles.cardText}
                    userHasEverSkippedSuggestion={false}
                    word={suggestionWord}
                    onContinuePress={() => {}}
                />
            </FlipCard>
        </GenericBottomSheet>
    );
};

const getStyles = () =>
    StyleSheet.create({
        cardText: {
            marginTop: MARGIN_VERTICAL * 2.5,
        },
        exampleCard: {
            alignSelf: 'stretch',
            flex: 0,
            height: 350,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
    });
