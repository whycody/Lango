import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL } from '../../constants/margins';
import { replaceLottieColor } from '../../utils/lottieUtils';
import { Header } from '../components';
import { CustomTheme } from '../Theme';
import { GenericBottomSheet } from './GenericBottomSheet';

type BundleAddedBottomSheetProps = {
    sheetName: string;
    onStartSessionPress: () => void;
};

export const BundleAddedBottomSheet = (props: BundleAddedBottomSheetProps) => {
    const { onStartSessionPress, sheetName } = props;
    const { t } = useTranslation();
    const { colors } = useTheme() as CustomTheme;

    const doneSource = replaceLottieColor(require('../../../assets/done.json'), [
        { from: '#5a67f6', to: colors.primary },
        { from: '#7a85ff', to: colors.primary300 },
        { from: '#6672ff', to: colors.primary600 },
        { from: '#9ca5ff', to: colors.primary800 },
    ]);

    const handleSecondaryButtonPress = () => {
        TrueSheet.dismiss(sheetName);
    };

    return (
        <GenericBottomSheet
            primaryActionIcon={'play'}
            primaryActionLabel={t('bundle_details.bundle_added.confirm')}
            secondaryActionLabel={t('bundle_details.bundle_added.later')}
            sheetName={sheetName}
            onPrimaryButtonPress={onStartSessionPress}
            onSecondaryButtonPress={handleSecondaryButtonPress}
        >
            <LottieView autoPlay={true} loop={false} source={doneSource} style={styles.lottie} />
            <Header
                centered
                style={styles.header}
                subtitle={t('bundle_details.bundle_added.desc')}
                title={t('bundle_details.bundle_added.title')}
            />
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
