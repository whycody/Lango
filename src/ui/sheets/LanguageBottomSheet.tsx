import React, { forwardRef, RefObject, useCallback, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FullWindowOverlay } from 'react-native-screens';

import { LanguageTypes } from '../../constants/Language';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { Language } from '../../types';
import { ActionButton } from '../components';
import { LanguagePicker } from '../containers/language';
import { PickLanguageLevelBottomSheet } from './PickLanguageLevelBottomSheet';

type LanguageBottomSheetProps = {
    allLanguages?: boolean;
    languageType?: LanguageTypes;
    onChangeIndex?: (index: number) => void;
};

export const LanguageBottomSheet = forwardRef<BottomSheetModal, LanguageBottomSheetProps>(
    (props, ref: RefObject<BottomSheetModal>) => {
        const { colors } = useTheme();
        const styles = getStyles(colors);
        const { allLanguages, languageType = LanguageTypes.MAIN, onChangeIndex } = props;
        const [pickedLanguage, setPickedLanguage] = useState<Language | null>(null);
        const pickLanguageLevelBottomSheetRef = React.useRef<BottomSheetModal>(null);
        const { t } = useTranslation();

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

        const dismiss = () => {
            ref && typeof ref !== 'function' && ref.current?.dismiss();
        };

        const handleLanguagePicked = useCallback(
            (language: Language, userEvaluatedLanguageLevel: boolean) => {
                dismiss();
                if (userEvaluatedLanguageLevel || languageType !== LanguageTypes.MAIN) return;
                setPickedLanguage(language);
                pickLanguageLevelBottomSheetRef.current?.present();
            },
            [ref, languageType],
        );

        return (
            <>
                <PickLanguageLevelBottomSheet
                    language={pickedLanguage}
                    ref={pickLanguageLevelBottomSheetRef}
                />
                <BottomSheetModal
                    backdropComponent={renderBackdrop}
                    backgroundStyle={styles.bottomSheetModal}
                    containerComponent={renderContainerComponent}
                    handleIndicatorStyle={styles.handleIndicatorStyle}
                    ref={ref}
                    onChange={(index: number) => onChangeIndex?.(index)}
                >
                    <BottomSheetScrollView>
                        <LanguagePicker
                            allLanguages={allLanguages}
                            languageType={languageType}
                            style={styles.languagePicker}
                            onLanguagePick={handleLanguagePicked}
                        />
                        <ActionButton
                            label={t('cancel')}
                            primary={true}
                            style={styles.button}
                            onPress={dismiss}
                        />
                    </BottomSheetScrollView>
                </BottomSheetModal>
            </>
        );
    },
);

const getStyles = (colors: any) =>
    StyleSheet.create({
        bottomSheetModal: {
            backgroundColor: colors.card,
        },
        button: {
            marginBottom: MARGIN_VERTICAL,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL / 2,
        },
        handleIndicatorStyle: {
            backgroundColor: colors.primary,
            borderRadius: 0,
        },
        languagePicker: {
            marginBottom: MARGIN_VERTICAL,
        },
    });
