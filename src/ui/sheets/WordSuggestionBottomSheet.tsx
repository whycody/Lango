import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { useUserPreferences } from '../../store';
import { CustomText } from '../components';
import { Card, FlipCard } from '../components/session';
import { CustomTheme } from '../Theme';
import { GenericBottomSheet } from './GenericBottomSheet';

type WordSuggestionBottomSheetProps = {
    sheetName: string;
};

export const WordSuggestionBottomSheet = (props: WordSuggestionBottomSheetProps) => {
    const { t } = useTranslation();
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);
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
                flip={flip}
                flipVertical={false}
                style={styles.exampleCard}
                swipeable={false}
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
            <CustomText style={styles.subtitle}>
                {t('word_suggestion_bottom_sheet.desc2')}
            </CustomText>
        </GenericBottomSheet>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
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
        subtitle: {
            color: colors.white300,
            fontSize: 15,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 16,
        },
    });
