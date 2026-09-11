import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiErrorCode } from '../../../../api/api.types';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../../constants/margins';
import { DeleteBundleResult } from '../../../../types';
import { Alert } from '../../../../ui/components/flashcards';
import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';
import { BUNDLE_REMOVE_ERROR_MESSAGE_KEYS } from '../constants';

type RemoveBundleBottomSheetProps = {
    sheetName: string;
    onCancel: () => void;
    onRemove: () => Promise<DeleteBundleResult>;
};

export const RemoveBundleBottomSheet = ({
    onCancel,
    onRemove,
    sheetName,
}: RemoveBundleBottomSheetProps) => {
    const { t } = useTranslation();
    const [removing, setRemoving] = useState(false);
    const [errorCode, setErrorCode] = useState<ApiErrorCode | null>(null);

    const handleRemovePress = async () => {
        setErrorCode(null);
        setRemoving(true);
        try {
            const result = await onRemove();
            if (!result.success) setErrorCode(result.errorCode);
        } finally {
            setRemoving(false);
        }
    };

    const handleDidDismiss = () => {
        setErrorCode(null);
    };

    return (
        <GenericBottomSheet
            description={t('bundle_details.removing.desc')}
            primaryActionIcon="trash"
            primaryActionLabel={t('delete')}
            primaryButtonLoading={removing}
            secondaryActionLabel={t('cancel')}
            secondaryButtonEnabled={!removing}
            sheetName={sheetName}
            style={styles.content}
            title={t('bundle_details.removing.title')}
            onDidDismiss={handleDidDismiss}
            onPrimaryButtonPress={handleRemovePress}
            onSecondaryButtonPress={onCancel}
        >
            {errorCode && (
                <Alert
                    message={t(BUNDLE_REMOVE_ERROR_MESSAGE_KEYS[errorCode])}
                    style={styles.alert}
                    title={t('error')}
                    type="error"
                />
            )}
        </GenericBottomSheet>
    );
};

const styles = {
    alert: {
        marginTop: MARGIN_VERTICAL / 2,
    },
    content: {
        paddingHorizontal: MARGIN_HORIZONTAL,
    },
};
