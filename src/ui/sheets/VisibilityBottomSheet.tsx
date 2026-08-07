import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { useWordsBundle } from '../../store';
import { WordsBundleVisibility } from '../../types';
import { VisibilityPicker } from '../containers/bundles/VisibilityPicker';
import { GenericBottomSheet } from './GenericBottomSheet';

type VisibilityBottomSheetProps = {
    bundleId?: string;
    sheetName: string;
};

export const VisibilityBottomSheet = ({ bundleId, sheetName }: VisibilityBottomSheetProps) => {
    const { bundles, editBundle } = useWordsBundle();
    const { t } = useTranslation();

    const bundle = bundleId ? bundles.find(b => b.id === bundleId) : undefined;

    const handleSelect = (visibility: WordsBundleVisibility) => {
        if (!bundle) return;
        editBundle({ id: bundle.id, visibility });
        TrueSheet.dismissAll();
    };

    return (
        <GenericBottomSheet
            primaryActionLabel={t('cancel')}
            sheetName={sheetName}
            onPrimaryButtonPress={() => TrueSheet.dismiss(sheetName)}
        >
            <VisibilityPicker value={bundle?.visibility ?? 'public'} onSelect={handleSelect} />
        </GenericBottomSheet>
    );
};
