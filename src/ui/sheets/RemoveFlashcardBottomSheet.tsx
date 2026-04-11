import React, { ForwardedRef, forwardRef, useCallback } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FullWindowOverlay } from 'react-native-screens';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { useWordsWithDetails } from '../../store';
import { ActionButton, CustomText, Header } from '../components';
import { FlashcardListItem } from '../components/flashcards';

type RemoveFlashcardBottomSheetProps = {
    flashcardId: string;
    onCancel: () => void;
    onChangeIndex?: (index: number) => void;
    onRemove: () => void;
};

export const RemoveFlashcardBottomSheet = forwardRef<
    BottomSheetModal,
    RemoveFlashcardBottomSheetProps
>((props, ref: ForwardedRef<BottomSheetModal>) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { t } = useTranslation();
    const wordsWithDetailsContext = useWordsWithDetails();

    const flashcard = wordsWithDetailsContext.wordsWithDetails.find(
        word => word.id === props.flashcardId,
    );

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />
        ),
        [],
    );

    const renderContainerComponent =
        Platform.OS === 'ios'
            ? useCallback(
                  ({ children }: any) => <FullWindowOverlay>{children}</FullWindowOverlay>,
                  [],
              )
            : undefined;

    return (
        <BottomSheetModal
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.bottomSheetModal}
            containerComponent={renderContainerComponent}
            handleIndicatorStyle={styles.handleIndicatorStyle}
            ref={ref}
            onChange={(index: number) => props.onChangeIndex?.(index)}
        >
            <BottomSheetView style={styles.root}>
                <Header
                    style={styles.header}
                    subtitle={t('removingFlashcardDesc')}
                    title={t('removingFlashcard')}
                />
                <FlashcardListItem
                    id={props.flashcardId}
                    level={flashcard?.gradeThreeProb ?? 0}
                    style={styles.item}
                    text={flashcard?.text}
                    translation={flashcard?.translation}
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
            </BottomSheetView>
        </BottomSheetModal>
    );
});

const getStyles = (colors: any) =>
    StyleSheet.create({
        actionText: {
            color: colors.primary,
            fontSize: 13,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: MARGIN_VERTICAL,
            textAlign: 'center',
        },
        bottomSheetModal: {
            backgroundColor: colors.card,
        },
        button: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        handleIndicatorStyle: {
            backgroundColor: colors.primary,
            borderRadius: 0,
        },
        header: {
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: MARGIN_VERTICAL / 2,
        },
        item: {
            backgroundColor: colors.background,
        },
        root: {
            flex: 1,
        },
    });
