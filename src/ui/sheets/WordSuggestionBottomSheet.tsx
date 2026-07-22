import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { useUserPreferences } from '../../store';
import { CustomText } from '../components';
import { CustomTheme } from '../Theme';
import { GenericBottomSheet } from './GenericBottomSheet';

type WordSuggestionBottomSheetProps = {
    sheetName: string;
};

const COUNTDOWN_START_SECONDS = 5;

export const WordSuggestionBottomSheet = (props: WordSuggestionBottomSheetProps) => {
    const { t } = useTranslation();
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);
    const [countdown, setCountdown] = useState(COUNTDOWN_START_SECONDS);
    const [visible, setVisible] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const { setUserHasEverSeenSuggestionInSession } = useUserPreferences();

    const clearCountdownInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => clearCountdownInterval, []);

    useEffect(() => {
        clearCountdownInterval();
        if (!visible) return;

        setCountdown(COUNTDOWN_START_SECONDS);
        intervalRef.current = setInterval(() => {
            setCountdown(current => {
                if (current <= 1) {
                    clearCountdownInterval();
                    return 0;
                }
                return current - 1;
            });
        }, 1000);

        return clearCountdownInterval;
    }, [visible]);

    const handlePrimaryButtonPress = () => {
        if (countdown > 0) return;
        TrueSheet.dismiss(props.sheetName);
        setUserHasEverSeenSuggestionInSession(true);
    };

    const primaryActionLabel =
        countdown > 0 ? `${t('common.got_it')} (${countdown})` : t('common.got_it');

    return (
        <GenericBottomSheet
            allowDismiss={false}
            description={t('word_suggestion_bottom_sheet.desc')}
            primaryActionLabel={primaryActionLabel}
            primaryButtonEnabled={countdown === 0}
            sheetName={props.sheetName}
            title={t('word_suggestion_bottom_sheet.title')}
            onDidDismiss={() => setVisible(false)}
            onDidPresent={() => setVisible(true)}
            onPrimaryButtonPress={handlePrimaryButtonPress}
        >
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
