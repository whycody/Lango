import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL } from '../../../../constants/margins';
import { Header } from '../../../../ui/components';
import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';
import { CustomTheme } from '../../../../ui/Theme';
import { replaceLottieColor } from '../../../../utils/lottieUtils';

type BundleReadyBottomSheetProps = {
    isNewBundle?: boolean;
    sheetName: string;
    userHasEditPermission: boolean;
    wordsAreAvailable: boolean;
    onAddWordsPress: () => void;
    onStartSessionPress: () => void;
};

export const BundleReadyBottomSheet = (props: BundleReadyBottomSheetProps) => {
    const {
        isNewBundle = false,
        onAddWordsPress,
        onStartSessionPress,
        sheetName,
        userHasEditPermission,
        wordsAreAvailable,
    } = props;
    const { t } = useTranslation();
    const { colors } = useTheme() as CustomTheme;

    const doneSource = replaceLottieColor(require('../../../../../assets/done.json'), [
        { from: '#5a67f6', to: colors.primary },
        { from: '#7a85ff', to: colors.primary300 },
        { from: '#6672ff', to: colors.primary600 },
        { from: '#9ca5ff', to: colors.primary800 },
    ]);

    const handleClose = () => {
        TrueSheet.dismiss(sheetName);
    };

    const title = t(
        isNewBundle
            ? 'bundle_details.bundle_ready.title_new_bundle'
            : 'bundle_details.bundle_ready.title_joined_bundle',
    );

    const variant = wordsAreAvailable
        ? 'has_words'
        : userHasEditPermission
          ? 'no_words_editable'
          : 'no_words_readonly';

    const description = t(`bundle_details.bundle_ready.${variant}.desc`);
    const primaryActionLabel = t(`bundle_details.bundle_ready.${variant}.confirm`);
    const secondaryActionLabel =
        variant === 'no_words_readonly'
            ? undefined
            : t(`bundle_details.bundle_ready.${variant}.secondary`);
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
            primaryActionLabel={primaryActionLabel}
            secondaryActionLabel={secondaryActionLabel}
            sheetName={sheetName}
            onPrimaryButtonPress={handlePrimaryButtonPress}
            onSecondaryButtonPress={handleClose}
        >
            <LottieView autoPlay={true} loop={false} source={doneSource} style={styles.lottie} />
            <Header centered style={styles.header} subtitle={description} title={title} />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    header: {
        marginHorizontal: MARGIN_HORIZONTAL,
    },
    lottie: {
        height: 200,
        marginBottom: -10,
        pointerEvents: 'none',
    },
});
