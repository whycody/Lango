import React from 'react';
import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { ThemePicker } from '../containers/theme/ThemePicker';
import { GenericBottomSheet } from './GenericBottomSheet';

type ThemeBottomSheetProps = {
    sheetName: string;
};

export const ThemeBottomSheet = ({ sheetName }: ThemeBottomSheetProps) => {
    const { t } = useTranslation();

    return (
        <GenericBottomSheet
            primaryActionLabel={t('cancel')}
            sheetName={sheetName}
            style={styles.sheet}
            onPrimaryButtonPress={() => TrueSheet.dismiss(sheetName)}
        >
            <ThemePicker onThemeSelect={() => TrueSheet.dismiss(sheetName)} />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    sheet: {
        marginTop: 10,
    },
});
