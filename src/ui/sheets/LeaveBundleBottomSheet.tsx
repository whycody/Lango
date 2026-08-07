import { useTranslation } from 'react-i18next';

import { GenericBottomSheet } from './GenericBottomSheet';

type LeaveBundleBottomSheetProps = {
    sheetName: string;
    onCancel: () => void;
    onLeave: () => void;
};

export const LeaveBundleBottomSheet = ({ onCancel, onLeave, sheetName }: LeaveBundleBottomSheetProps) => {
    const { t } = useTranslation();

    return (
        <GenericBottomSheet
            description={t('bundle_details.leaving.desc')}
            primaryActionIcon="exit"
            primaryActionLabel={t('bundle_details.options.leave_bundle')}
            secondaryActionLabel={t('cancel')}
            sheetName={sheetName}
            title={t('bundle_details.leaving.title')}
            onPrimaryButtonPress={onLeave}
            onSecondaryButtonPress={onCancel}
        />
    );
};
