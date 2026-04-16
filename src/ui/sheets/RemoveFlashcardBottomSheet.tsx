import React from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MARGIN_VERTICAL } from '../../constants/margins';
import { useWordsWithDetails } from '../../store';
import { FlashcardListItem } from '../components/flashcards';
import { GenericBottomSheet } from './GenericBottomSheet';

type RemoveFlashcardBottomSheetProps = {
    flashcardId?: string;
    onCancel: () => void;
    onRemove: () => void;
    sheetName: string;
};

export const RemoveFlashcardBottomSheet = (props: RemoveFlashcardBottomSheetProps) => {
    const { t } = useTranslation();
    const wordsWithDetailsContext = useWordsWithDetails();

    const flashcard = (wordsWithDetailsContext.wordsWithDetails ?? []).find(
        word => word.id === props.flashcardId,
    );

    return (
        <GenericBottomSheet
            description={t('removingFlashcardDesc')}
            primaryActionLabel={t('continue')}
            secondaryActionLabel={t('cancel')}
            sheetName={props.sheetName}
            style={styles.bottomSheet}
            title={t('removingFlashcard')}
            onPrimaryButtonPress={props.onRemove}
            onSecondaryButtonPress={props.onCancel}
        >
            <FlashcardListItem
                id={props.flashcardId ?? ''}
                level={flashcard?.gradeThreeProb ?? 0}
                text={flashcard?.text ?? ''}
                translation={flashcard?.translation ?? ''}
            />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    bottomSheet: {
        marginTop: MARGIN_VERTICAL / 1.5,
    },
});
