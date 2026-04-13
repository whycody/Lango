import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { Card, FlipCard } from '../components/session';
import { GenericBottomSheet } from './GenericBottomSheet';

type HitFlashcardBottomSheetProps = {
    sheetName: string;
};

export const HitFlashcardBottomSheet = (props: HitFlashcardBottomSheetProps) => {
    const { t } = useTranslation();
    const styles = getStyles();
    const [flip, setFlip] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearFlipTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    useEffect(() => clearFlipTimeout, []);

    useEffect(() => {
        clearFlipTimeout();
        timeoutRef.current = setTimeout(() => setFlip(f => !f), 2000);
        return clearFlipTimeout;
    }, [flip]);

    const onFlipStart = () => {
        clearFlipTimeout();
        timeoutRef.current = setTimeout(() => setFlip(f => !f), 2000);
    };

    return (
        <GenericBottomSheet
            description={t('hit_flashcard_bottom_sheet.desc')}
            primaryActionLabel={t('hit_flashcard_bottom_sheet.got_it')}
            sheetName={props.sheetName}
            title={t('hit_flashcard_bottom_sheet.title')}
            onPrimaryButtonPress={() => TrueSheet.dismiss(props.sheetName)}
        >
            <FlipCard
                flipHorizontal
                flip={flip}
                flipVertical={false}
                style={styles.exampleCard}
                onFlipStart={onFlipStart}
            >
                <Card text={t('hit_flashcard_bottom_sheet.word')} />
                <Card text={t('hit_flashcard_bottom_sheet.translation')} />
            </FlipCard>
        </GenericBottomSheet>
    );
};

const getStyles = () =>
    StyleSheet.create({
        exampleCard: {
            alignSelf: 'stretch',
            height: 350,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
    });
