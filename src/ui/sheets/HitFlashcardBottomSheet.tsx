import React, { ForwardedRef, forwardRef, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import FlipCard from 'react-native-flip-card';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { Card } from '../components/session';
import { GenericBottomSheet } from './GenericBottomSheet';

type HitFlashcardBottomSheetProps = {
    onChangeIndex?: (index: number) => void;
};

export const HitFlashcardBottomSheet = forwardRef<BottomSheetModal, HitFlashcardBottomSheetProps>(
    (props, ref: ForwardedRef<BottomSheetModal>) => {
        const { t } = useTranslation();
        const styles = getStyles();
        const [flip, setFlip] = useState(false);
        const [isVisible, setIsVisible] = useState(false);
        const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

        const clearFlipTimeout = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };

        useEffect(() => clearFlipTimeout, []);

        useEffect(() => {
            if (!isVisible) clearFlipTimeout();
        }, [isVisible]);

        useEffect(() => {
            if (!isVisible) return;
            clearFlipTimeout();
            timeoutRef.current = setTimeout(() => setFlip(f => !f), 2000);
            return clearFlipTimeout;
        }, [flip, isVisible]);

        const onFlipStart = () => {
            clearFlipTimeout();
            timeoutRef.current = setTimeout(() => setFlip(f => !f), 2000);
        };

        const handleChangeIndex = (index?: number) => {
            setIsVisible(index !== undefined && index >= 0);
            if (props.onChangeIndex) props.onChangeIndex(index);
        };

        return (
            <GenericBottomSheet
                description={t('hit_flashcard_bottom_sheet.desc')}
                primaryActionLabel={t('hit_flashcard_bottom_sheet.got_it')}
                ref={ref}
                title={t('hit_flashcard_bottom_sheet.title')}
                onChangeIndex={handleChangeIndex}
                onPrimaryButtonPress={() =>
                    ref && typeof ref !== 'function' && ref.current?.dismiss()
                }
            >
                <FlipCard
                    alignHeight
                    alignWidth
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
    },
);

const getStyles = () =>
    StyleSheet.create({
        exampleCard: {
            alignSelf: 'center',
            height: 350,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
    });
