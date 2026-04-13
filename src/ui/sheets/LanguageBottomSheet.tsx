import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { BOTTOM_SHEET_GRABBER_OPTIONS } from '../../constants/Common';
import { LanguageTypes } from '../../constants/Language';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { Language } from '../../types';
import { ActionButton } from '../components';
import { LanguagePicker } from '../containers/language';
import { CustomTheme } from '../Theme';
import { PickLanguageLevelBottomSheet } from './PickLanguageLevelBottomSheet';

type LanguageBottomSheetProps = {
    allLanguages?: boolean;
    languageType?: LanguageTypes;
    sheetName: string;
};

export const LanguageBottomSheet = (props: LanguageBottomSheetProps) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);
    const { allLanguages, languageType = LanguageTypes.MAIN, sheetName } = props;
    const [pickedLanguage, setPickedLanguage] = useState<Language | null>(null);
    const { t } = useTranslation();
    const pickLevelSheetName = `${sheetName}-pick-level`;

    const handleLanguagePicked = useCallback(
        (language: Language, userEvaluatedLanguageLevel: boolean) => {
            TrueSheet.dismiss(sheetName);
            if (userEvaluatedLanguageLevel || languageType !== LanguageTypes.MAIN) return;
            setPickedLanguage(language);
            TrueSheet.present(pickLevelSheetName);
        },
        [sheetName, pickLevelSheetName, languageType],
    );

    return (
        <>
            <PickLanguageLevelBottomSheet
                language={pickedLanguage ?? undefined}
                sheetName={pickLevelSheetName}
            />
            <TrueSheet
                backgroundColor={colors.card}
                detents={['auto']}
                grabberOptions={BOTTOM_SHEET_GRABBER_OPTIONS}
                name={sheetName}
            >
                <View style={styles.root}>
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
                        onPress={() => TrueSheet.dismiss(sheetName)}
                    />
                </View>
            </TrueSheet>
        </>
    );
};

const getStyles = (_colors: CustomTheme['colors']) =>
    StyleSheet.create({
        button: {
            marginBottom: MARGIN_VERTICAL,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL / 2,
        },
        languagePicker: {
            marginBottom: MARGIN_VERTICAL,
            marginTop: MARGIN_VERTICAL / 2,
        },
        root: {
            paddingTop: MARGIN_VERTICAL / 2,
        },
    });
