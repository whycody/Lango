import { FC } from 'react';
import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

import { MARGIN_HORIZONTAL } from '../../../../constants/margins';
import { TranslationKey } from '../../../../types';
import { Header } from '../../../../ui/components';
import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';
import { CustomTheme } from '../../../../ui/Theme';
import { useThemedLottieSource } from '../../../../utils/lottieUtils';
import { BUNDLE_READY_LOTTIE_HEIGHT, BUNDLE_READY_LOTTIE_MARGIN_BOTTOM } from '../constants';

interface BundleReadyBottomSheetProps {
    isNewBundle?: boolean;
    sheetName: string;
    userHasEditPermission: boolean;
    wordsAreAvailable: boolean;
    onAddWordsPress: () => void;
    onStartSessionPress: () => void;
}

export const BundleReadyBottomSheet: FC<BundleReadyBottomSheetProps> = ({
    isNewBundle = false,
    onAddWordsPress,
    onStartSessionPress,
    sheetName,
    userHasEditPermission,
    wordsAreAvailable,
}) => {
    const { colors } = useTheme() as CustomTheme;

    const doneSource = useThemedLottieSource(require('../../../../../assets/done.json'), [
        { from: '#5a67f6', to: colors.primary },
        { from: '#7a85ff', to: colors.primary300 },
        { from: '#6672ff', to: colors.primary600 },
        { from: '#9ca5ff', to: colors.primary800 },
    ]);

    const handleClose = () => {
        TrueSheet.dismiss(sheetName);
    };

    const titleTx = isNewBundle
        ? 'bundle_details.bundle_ready.title_new_bundle'
        : 'bundle_details.bundle_ready.title_joined_bundle';

    const variant = wordsAreAvailable
        ? 'has_words'
        : userHasEditPermission
          ? 'no_words_editable'
          : 'no_words_readonly';

    const descriptionTx: TranslationKey = `bundle_details.bundle_ready.${variant}.desc`;
    const primaryActionLabelTx: TranslationKey = `bundle_details.bundle_ready.${variant}.confirm`;
    const secondaryActionLabelTx: TranslationKey | undefined =
        variant === 'no_words_readonly'
            ? undefined
            : `bundle_details.bundle_ready.${variant}.secondary`;
    const primaryActionIcon = variant === 'has_words' ? 'play' : undefined;

    const handlePrimaryButtonPress =
        variant === 'has_words'
            ? onStartSessionPress
            : variant === 'no_words_editable'
              ? onAddWordsPress
              : handleClose;

    return (
        <GenericBottomSheet
            primaryActionIcon={primaryActionIcon}
            primaryActionLabelTx={primaryActionLabelTx}
            secondaryActionLabelTx={secondaryActionLabelTx}
            sheetName={sheetName}
            onPrimaryButtonPress={handlePrimaryButtonPress}
            onSecondaryButtonPress={handleClose}
        >
            <LottieView autoPlay={true} loop={false} source={doneSource} style={styles.lottie} />
            <Header centered style={styles.header} subtitleTx={descriptionTx} titleTx={titleTx} />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    header: {
        marginHorizontal: MARGIN_HORIZONTAL,
    },
    lottie: {
        height: BUNDLE_READY_LOTTIE_HEIGHT,
        marginBottom: BUNDLE_READY_LOTTIE_MARGIN_BOTTOM,
        pointerEvents: 'none',
    },
});
