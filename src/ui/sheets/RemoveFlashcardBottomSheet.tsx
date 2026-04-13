import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { BOTTOM_SHEET_GRABBER_OPTIONS } from '../../constants/Common';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { useWordsWithDetails } from '../../store';
import { ActionButton, CustomText, Header } from '../components';
import { FlashcardListItem } from '../components/flashcards';
import { CustomTheme } from '../Theme';

type RemoveFlashcardBottomSheetProps = {
    flashcardId?: string;
    onCancel: () => void;
    onRemove: () => void;
    sheetName: string;
};

export const RemoveFlashcardBottomSheet = (props: RemoveFlashcardBottomSheetProps) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);
    const { t } = useTranslation();
    const wordsWithDetailsContext = useWordsWithDetails();

    const flashcard = (wordsWithDetailsContext.wordsWithDetails ?? []).find(
        word => word.id === props.flashcardId,
    );

    return (
        <TrueSheet
            backgroundColor={colors.card}
            detents={['auto']}
            grabberOptions={BOTTOM_SHEET_GRABBER_OPTIONS}
            name={props.sheetName}
        >
            <View style={styles.root}>
                <Header
                    style={styles.header}
                    subtitle={t('removingFlashcardDesc')}
                    title={t('removingFlashcard')}
                />
                <FlashcardListItem
                    id={props.flashcardId ?? ''}
                    level={flashcard?.gradeThreeProb ?? 0}
                    style={styles.item}
                    text={flashcard?.text ?? ''}
                    translation={flashcard?.translation ?? ''}
                />
                <ActionButton
                    label={t('continue')}
                    primary={true}
                    style={styles.button}
                    onPress={props.onRemove}
                />
                <CustomText style={styles.actionText} weight={'SemiBold'} onPress={props.onCancel}>
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
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: MARGIN_VERTICAL,
            textAlign: 'center',
        },
        button: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        header: {
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: MARGIN_VERTICAL / 2,
        },
        item: {
            backgroundColor: colors.background,
        },
        root: {
            paddingTop: MARGIN_VERTICAL,
        },
    });
