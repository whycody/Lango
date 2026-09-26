import { FC } from 'react';

import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';

interface LeaveBundleBottomSheetProps {
    sheetName: string;
    onCancel: () => void;
    onLeave: () => void;
}

export const LeaveBundleBottomSheet: FC<LeaveBundleBottomSheetProps> = ({
    onCancel,
    onLeave,
    sheetName,
}) => (
    <GenericBottomSheet
        descriptionTx="bundle_details.leaving.desc"
        primaryActionIcon="exit-outline"
        primaryActionLabelTx="bundle_details.options.leave_bundle"
        secondaryActionLabelTx="cancel"
        sheetName={sheetName}
        titleTx="bundle_details.leaving.title"
        onPrimaryButtonPress={onLeave}
        onSecondaryButtonPress={onCancel}
    />
);
