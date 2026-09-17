import { FC, useState } from 'react';

import { ApiErrorCode } from '../../../../api/api.types';
import { Alert } from '../../../../components';
import { MARGIN_HORIZONTAL, spacing } from '../../../../constants/margins';
import { DeleteBundleResult } from '../../../../types';
import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';
import { BUNDLE_REMOVE_ERROR_MESSAGE_KEYS } from '../constants';

interface RemoveBundleBottomSheetProps {
    sheetName: string;
    onCancel: () => void;
    onRemove: () => Promise<DeleteBundleResult>;
}

export const RemoveBundleBottomSheet: FC<RemoveBundleBottomSheetProps> = ({
    onCancel,
    onRemove,
    sheetName,
}) => {
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
            descriptionTx="bundle_details.removing.desc"
            primaryActionIcon="trash"
            primaryActionLabelTx="delete"
            primaryButtonLoading={removing}
            secondaryActionLabelTx="cancel"
            secondaryButtonEnabled={!removing}
            sheetName={sheetName}
            style={styles.content}
            titleTx="bundle_details.removing.title"
            onDidDismiss={handleDidDismiss}
            onPrimaryButtonPress={handleRemovePress}
            onSecondaryButtonPress={onCancel}
        >
            {errorCode && (
                <Alert
                    messageTx={BUNDLE_REMOVE_ERROR_MESSAGE_KEYS[errorCode]}
                    style={styles.alert}
                    titleTx="error"
                    type="error"
                />
            )}
        </GenericBottomSheet>
    );
};

const styles = {
    alert: {
        marginTop: spacing.l,
    },
    content: {
        paddingHorizontal: MARGIN_HORIZONTAL,
    },
};
