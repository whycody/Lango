import { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

type OnboardingHeaderProps = {
    currentStep: number;
    totalSteps: number;
    onLogout?: () => void;
};

export const OnboardingHeader: FC<OnboardingHeaderProps> = ({
    currentStep,
    onLogout,
    totalSteps,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const { top } = useSafeAreaInsets();
    const { t } = useTranslation();
    const styles = getStyles(colors);

    return (
        <>
            <View style={[styles.topInsetSpacer, { height: top }]} />
            <View style={styles.container}>
                <CustomText style={styles.logoutText} weight="SemiBold" onPress={onLogout}>
                    {t('logout')}
                </CustomText>
                <View style={styles.progressBarWrapper}>
                    <ProgressBar
                        color={colors.primary}
                        progress={(currentStep + 1) / (totalSteps + 1)}
                        style={styles.progressBar}
                    />
                </View>
            </View>
        </>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        container: {
            backgroundColor: colors.card,
            marginBottom: -5,
        },
        logoutText: {
            alignSelf: 'flex-end',
            backgroundColor: colors.card,
            color: colors.primary300,
            fontSize: 13,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: 10,
            textTransform: 'uppercase',
        },
        progressBar: {
            backgroundColor: colors.cardAccent,
            height: 5,
            marginTop: 12,
        },
        progressBarWrapper: {
            marginHorizontal: MARGIN_HORIZONTAL,
        },
        topInsetSpacer: {
            backgroundColor: colors.card,
        },
    });
