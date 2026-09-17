import { FC, useMemo } from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

import { useWordsBundle } from '../../../../store';
import { WordsBundleVisibility } from '../../../../types';
import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';
import { VisibilityPicker } from '../containers/visibility-picker';

interface VisibilityBottomSheetProps {
    bundleId?: string;
    sheetName: string;
}

export const VisibilityBottomSheet: FC<VisibilityBottomSheetProps> = ({ bundleId, sheetName }) => {
    const { bundles, editBundle } = useWordsBundle();

    const bundle = useMemo(
        () => (bundleId ? bundles.find(b => b.id === bundleId) : undefined),
        [bundleId, bundles],
    );

    const handleSelect = (visibility: WordsBundleVisibility) => {
        if (!bundle) return;
        editBundle({ id: bundle.id, visibility });
        TrueSheet.dismissAll();
    };

    return (
        <GenericBottomSheet
            primaryActionLabelTx="cancel"
            sheetName={sheetName}
            onPrimaryButtonPress={() => TrueSheet.dismiss(sheetName)}
        >
            <VisibilityPicker value={bundle?.visibility ?? 'public'} onSelect={handleSelect} />
        </GenericBottomSheet>
    );
};
