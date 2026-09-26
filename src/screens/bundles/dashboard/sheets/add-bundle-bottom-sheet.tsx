import { FC } from 'react';
import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

import { MARGIN_HORIZONTAL, spacing } from '../../../../constants/margins';
import { ActionButton } from '../../../../ui/components/ActionButton';
import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';

interface AddBundleBottomSheetProps {
    sheetName: string;
    onCreateNew: () => void;
    onJoinWithCode: () => void;
}

export const AddBundleBottomSheet: FC<AddBundleBottomSheetProps> = ({
    onCreateNew,
    onJoinWithCode,
    sheetName,
}) => {
    const handleCreateNewPress = () => {
        onCreateNew();
    };

    const handleJoinWithCodePress = () => {
        onJoinWithCode();
    };

    const handleOnSecondaryButtonPress = () => {
        TrueSheet.dismiss(sheetName);
    };

    return (
        <GenericBottomSheet
            descriptionTx="bundles.add_new_desc"
            secondaryActionLabelTx="cancel"
            sheetName={sheetName}
            style={styles.sheet}
            titleTx="bundles.add_new_title"
            onSecondaryButtonPress={handleOnSecondaryButtonPress}
        >
            <ActionButton primary labelTx="bundles.create_new" onPress={handleCreateNewPress} />
            <ActionButton
                icon="key"
                labelTx="bundles.join_with_code"
                style={styles.secondaryButton}
                onPress={handleJoinWithCodePress}
            />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    secondaryButton: {
        marginTop: spacing.l,
    },
    sheet: {
        marginHorizontal: MARGIN_HORIZONTAL,
        marginTop: spacing.xl,
    },
});
