import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL } from '../../constants/margins';
import { Header } from '../components/Header';
import { GenericBottomSheet } from './GenericBottomSheet';
import { START_SESSION_BOTTOM_SHEET } from './StartSessionBottomSheet';

type OnboardingBottomSheetProps = {
    sheetName: string;
};

export const OnboardingBottomSheet = (props: OnboardingBottomSheetProps) => {
    const { t } = useTranslation();

    const handlePrimaryButtonPress = () => {
        TrueSheet.present(START_SESSION_BOTTOM_SHEET);
    };

    return (
        <GenericBottomSheet
            allowDismiss={false}
            primaryActionIcon="play-sharp"
            primaryActionLabel={t('startLearning')}
            sheetName={props.sheetName}
            onPrimaryButtonPress={handlePrimaryButtonPress}
        >
            <View style={styles.lottieWrapper}>
                <LottieView
                    autoPlay={true}
                    loop={true}
                    source={require('../../../assets/face.json')}
                    style={styles.lottie}
                />
            </View>
            <Header
                style={styles.header}
                subtitle={t('onboarding.onboarding_desc')}
                title={t('onboarding.welcome')}
            />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    header: {
        marginHorizontal: MARGIN_HORIZONTAL,
        marginTop: 10,
    },
    lottie: {
        height: 250,
        marginBottom: -10,
        pointerEvents: 'none',
    },
    lottieWrapper: {
        pointerEvents: 'none',
    },
});
